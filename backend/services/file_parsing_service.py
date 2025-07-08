import uuid
import json
import logging
import re
import csv
import xml.etree.ElementTree as ET
from datetime import datetime, date
from typing import List, Optional, Dict, Any, Tuple, Union
from io import StringIO, BytesIO
from decimal import Decimal

from models.banking import BankStatementImport, BankTransaction, BankConnection
from schemas.banking_schemas import (
    BankStatementImportCreate, BankTransactionCreate, ImportStatusEnum,
    FileUploadResponse
)

logger = logging.getLogger(__name__)


class FileParsingService:
    """Service for parsing bank statement files (OFX, QFX, CSV)"""
    
    def __init__(self, db=None):
        self.db = db
    
    async def parse_file(
        self, 
        file_content: bytes, 
        file_name: str, 
        file_type: str,
        connection_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Parse a bank statement file and extract transactions"""
        try:
            if file_type.lower() in ['ofx', 'qfx']:
                return await self._parse_ofx_file(file_content, file_name)
            elif file_type.lower() == 'csv':
                return await self._parse_csv_file(file_content, file_name)
            else:
                return {
                    "success": False,
                    "error": f"Unsupported file type: {file_type}",
                    "transactions": []
                }
                
        except Exception as e:
            logger.error(f"Error parsing file {file_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "transactions": []
            }
    
    async def _parse_ofx_file(self, file_content: bytes, file_name: str) -> Dict[str, Any]:
        """Parse OFX/QFX bank statement file"""
        try:
            content = file_content.decode('utf-8')
            
            # Clean up OFX content (remove SGML headers if present)
            content = self._clean_ofx_content(content)
            
            # Parse XML
            root = ET.fromstring(content)
            
            # Extract bank account info
            bank_info = self._extract_bank_info(root)
            
            # Extract transactions
            transactions = self._extract_ofx_transactions(root)
            
            return {
                "success": True,
                "file_name": file_name,
                "file_type": "ofx",
                "bank_info": bank_info,
                "transactions": transactions,
                "transaction_count": len(transactions),
                "error": None
            }
            
        except ET.ParseError as e:
            logger.error(f"XML parsing error in {file_name}: {e}")
            return {
                "success": False,
                "error": f"Invalid OFX/XML format: {str(e)}",
                "transactions": []
            }
        except Exception as e:
            logger.error(f"Error parsing OFX file {file_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "transactions": []
            }
    
    async def _parse_csv_file(self, file_content: bytes, file_name: str) -> Dict[str, Any]:
        """Parse CSV bank statement file"""
        try:
            content = file_content.decode('utf-8')
            
            # Detect CSV format and delimiter
            delimiter = self._detect_csv_delimiter(content)
            
            # Parse CSV
            csv_reader = csv.DictReader(StringIO(content), delimiter=delimiter)
            
            # Try to map CSV headers to our transaction fields
            field_mapping = self._detect_csv_field_mapping(csv_reader.fieldnames)
            
            transactions = []
            for row_num, row in enumerate(csv_reader, 1):
                try:
                    transaction = self._parse_csv_transaction(row, field_mapping, row_num)
                    if transaction:
                        transactions.append(transaction)
                except Exception as e:
                    logger.warning(f"Error parsing CSV row {row_num}: {e}")
                    continue
            
            return {
                "success": True,
                "file_name": file_name,
                "file_type": "csv",
                "field_mapping": field_mapping,
                "transactions": transactions,
                "transaction_count": len(transactions),
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error parsing CSV file {file_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "transactions": []
            }
    
    def _clean_ofx_content(self, content: str) -> str:
        """Clean OFX content to make it valid XML"""
        # Remove SGML headers and make it valid XML
        lines = content.split('\n')
        xml_start = -1
        
        # Find where XML starts
        for i, line in enumerate(lines):
            if '<OFX>' in line.upper() or '<?XML' in line.upper():
                xml_start = i
                break
        
        if xml_start >= 0:
            content = '\n'.join(lines[xml_start:])
        
        # Fix common OFX issues
        content = re.sub(r'<([^>]+)>([^<]*)\n', r'<\1>\2</\1>\n', content)
        
        # Add XML declaration if missing
        if not content.strip().startswith('<?xml'):
            content = '<?xml version="1.0" encoding="UTF-8"?>\n' + content
        
        return content
    
    def _extract_bank_info(self, root: ET.Element) -> Dict[str, str]:
        """Extract bank account information from OFX"""
        bank_info = {}
        
        try:
            # Find bank account info
            bankacctfrom = root.find('.//BANKACCTFROM')
            if bankacctfrom is not None:
                bank_info['bank_id'] = self._get_element_text(bankacctfrom.find('BANKID'))
                bank_info['account_id'] = self._get_element_text(bankacctfrom.find('ACCTID'))
                bank_info['account_type'] = self._get_element_text(bankacctfrom.find('ACCTTYPE'))
            
            # Find credit card account info
            ccacctfrom = root.find('.//CCACCTFROM')
            if ccacctfrom is not None:
                bank_info['account_id'] = self._get_element_text(ccacctfrom.find('ACCTID'))
                bank_info['account_type'] = 'CREDITCARD'
            
        except Exception as e:
            logger.warning(f"Error extracting bank info: {e}")
        
        return bank_info
    
    def _extract_ofx_transactions(self, root: ET.Element) -> List[Dict[str, Any]]:
        """Extract transactions from OFX"""
        transactions = []
        
        try:
            # Find all STMTTRN (statement transaction) elements
            stmttrns = root.findall('.//STMTTRN')
            
            for stmttrn in stmttrns:
                transaction = self._parse_ofx_transaction(stmttrn)
                if transaction:
                    transactions.append(transaction)
            
        except Exception as e:
            logger.error(f"Error extracting OFX transactions: {e}")
        
        return transactions
    
    def _parse_ofx_transaction(self, stmttrn: ET.Element) -> Optional[Dict[str, Any]]:
        """Parse a single OFX transaction"""
        try:
            transaction = {
                'transaction_id': self._get_element_text(stmttrn.find('FITID')),
                'transaction_type': self._get_element_text(stmttrn.find('TRNTYPE')),
                'posted_date': self._parse_ofx_date(self._get_element_text(stmttrn.find('DTPOSTED'))),
                'amount': self._parse_decimal(self._get_element_text(stmttrn.find('TRNAMT'))),
                'description': self._get_element_text(stmttrn.find('NAME')),
                'memo': self._get_element_text(stmttrn.find('MEMO')),
                'check_number': self._get_element_text(stmttrn.find('CHECKNUM')),
                'reference_number': self._get_element_text(stmttrn.find('REFNUM'))
            }
            
            # Set transaction date (use posted date if available)
            transaction['transaction_date'] = transaction['posted_date']
            
            # Combine description and memo
            description_parts = []
            if transaction['description']:
                description_parts.append(transaction['description'])
            if transaction['memo']:
                description_parts.append(transaction['memo'])
            
            transaction['full_description'] = ' - '.join(description_parts)
            
            # Determine transaction type
            if transaction['amount'] and float(transaction['amount']) < 0:
                transaction['transaction_type'] = 'debit'
            else:
                transaction['transaction_type'] = 'credit'
            
            return transaction
            
        except Exception as e:
            logger.warning(f"Error parsing OFX transaction: {e}")
            return None
    
    def _detect_csv_delimiter(self, content: str) -> str:
        """Detect CSV delimiter"""
        # Check first few lines for common delimiters
        first_lines = content.split('\n')[:5]
        delimiters = [',', ';', '\t', '|']
        
        delimiter_scores = {}
        for delimiter in delimiters:
            score = 0
            for line in first_lines:
                if delimiter in line:
                    score += line.count(delimiter)
            delimiter_scores[delimiter] = score
        
        # Return delimiter with highest score
        return max(delimiter_scores, key=delimiter_scores.get) if delimiter_scores else ','
    
    def _detect_csv_field_mapping(self, headers: List[str]) -> Dict[str, str]:
        """Detect CSV field mapping based on headers"""
        if not headers:
            return {}
        
        # Common field name patterns
        field_patterns = {
            'date': ['date', 'transaction date', 'posted date', 'trans date'],
            'amount': ['amount', 'transaction amount', 'debit', 'credit'],
            'description': ['description', 'memo', 'transaction description', 'details'],
            'transaction_id': ['transaction id', 'trans id', 'reference', 'ref'],
            'balance': ['balance', 'running balance', 'account balance'],
            'check_number': ['check number', 'check num', 'check #'],
            'merchant': ['merchant', 'payee', 'vendor']
        }
        
        mapping = {}
        for header in headers:
            header_lower = header.lower().strip()
            
            for field, patterns in field_patterns.items():
                for pattern in patterns:
                    if pattern in header_lower:
                        mapping[field] = header
                        break
                if field in mapping:
                    break
        
        return mapping
    
    def _parse_csv_transaction(
        self, 
        row: Dict[str, str], 
        field_mapping: Dict[str, str], 
        row_num: int
    ) -> Optional[Dict[str, Any]]:
        """Parse a single CSV transaction row"""
        try:
            transaction = {}
            
            # Parse date
            date_field = field_mapping.get('date')
            if date_field and row.get(date_field):
                transaction['transaction_date'] = self._parse_date(row[date_field])
                transaction['posted_date'] = transaction['transaction_date']
            else:
                # Skip transactions without dates
                return None
            
            # Parse amount
            amount_field = field_mapping.get('amount')
            if amount_field and row.get(amount_field):
                transaction['amount'] = self._parse_decimal(row[amount_field])
            else:
                # Skip transactions without amounts
                return None
            
            # Parse other fields
            description_field = field_mapping.get('description')
            if description_field and row.get(description_field):
                transaction['description'] = row[description_field].strip()
                transaction['full_description'] = transaction['description']
            
            transaction_id_field = field_mapping.get('transaction_id')
            if transaction_id_field and row.get(transaction_id_field):
                transaction['transaction_id'] = row[transaction_id_field].strip()
            else:
                # Generate transaction ID if not provided
                transaction['transaction_id'] = f"CSV_{row_num}_{uuid.uuid4().hex[:8]}"
            
            balance_field = field_mapping.get('balance')
            if balance_field and row.get(balance_field):
                transaction['balance'] = self._parse_decimal(row[balance_field])
            
            check_field = field_mapping.get('check_number')
            if check_field and row.get(check_field):
                transaction['check_number'] = row[check_field].strip()
            
            merchant_field = field_mapping.get('merchant')
            if merchant_field and row.get(merchant_field):
                transaction['merchant_name'] = row[merchant_field].strip()
            
            # Determine transaction type
            if transaction['amount'] and float(transaction['amount']) < 0:
                transaction['transaction_type'] = 'debit'
            else:
                transaction['transaction_type'] = 'credit'
            
            return transaction
            
        except Exception as e:
            logger.warning(f"Error parsing CSV row {row_num}: {e}")
            return None
    
    def _get_element_text(self, element: Optional[ET.Element]) -> Optional[str]:
        """Get text content from XML element"""
        if element is not None and element.text:
            return element.text.strip()
        return None
    
    def _parse_ofx_date(self, date_str: Optional[str]) -> Optional[date]:
        """Parse OFX date format (YYYYMMDD or YYYYMMDDHHMMSS)"""
        if not date_str:
            return None
        
        try:
            # Remove timezone info if present
            date_str = date_str.split('[')[0]
            
            # Parse date
            if len(date_str) >= 8:
                year = int(date_str[:4])
                month = int(date_str[4:6])
                day = int(date_str[6:8])
                return date(year, month, day)
        except (ValueError, IndexError) as e:
            logger.warning(f"Error parsing OFX date '{date_str}': {e}")
        
        return None
    
    def _parse_date(self, date_str: str) -> Optional[date]:
        """Parse date string in various formats"""
        if not date_str:
            return None
        
        # Common date formats
        date_formats = [
            '%Y-%m-%d',
            '%m/%d/%Y',
            '%d/%m/%Y',
            '%m-%d-%Y',
            '%d-%m-%Y',
            '%Y/%m/%d',
            '%m/%d/%y',
            '%d/%m/%y'
        ]
        
        for format_str in date_formats:
            try:
                parsed_date = datetime.strptime(date_str.strip(), format_str)
                return parsed_date.date()
            except ValueError:
                continue
        
        logger.warning(f"Could not parse date: {date_str}")
        return None
    
    def _parse_decimal(self, amount_str: Optional[str]) -> Optional[float]:
        """Parse decimal amount string"""
        if not amount_str:
            return None
        
        try:
            # Remove currency symbols and spaces
            amount_str = re.sub(r'[^\d\.\-\+]', '', amount_str.strip())
            
            if amount_str:
                return float(amount_str)
        except (ValueError, TypeError) as e:
            logger.warning(f"Error parsing amount '{amount_str}': {e}")
        
        return None
    
    async def validate_parsed_transactions(
        self, 
        parsed_data: Dict[str, Any],
        connection_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Validate parsed transactions and check for duplicates"""
        if not parsed_data.get('success'):
            return parsed_data
        
        transactions = parsed_data.get('transactions', [])
        validation_results = {
            "valid_transactions": [],
            "invalid_transactions": [],
            "duplicate_transactions": [],
            "validation_errors": []
        }
        
        for i, transaction in enumerate(transactions):
            try:
                # Validate required fields
                if not transaction.get('transaction_date'):
                    validation_results["invalid_transactions"].append({
                        "row": i + 1,
                        "error": "Missing transaction date",
                        "transaction": transaction
                    })
                    continue
                
                if not transaction.get('amount'):
                    validation_results["invalid_transactions"].append({
                        "row": i + 1,
                        "error": "Missing transaction amount",
                        "transaction": transaction
                    })
                    continue
                
                if not transaction.get('transaction_id'):
                    validation_results["invalid_transactions"].append({
                        "row": i + 1,
                        "error": "Missing transaction ID",
                        "transaction": transaction
                    })
                    continue
                
                # Check for duplicates in database if connection provided
                if connection_id and self.db:
                    is_duplicate = await self._check_transaction_duplicate(
                        connection_id, transaction['transaction_id']
                    )
                    if is_duplicate:
                        validation_results["duplicate_transactions"].append({
                            "row": i + 1,
                            "transaction_id": transaction['transaction_id'],
                            "transaction": transaction
                        })
                        continue
                
                validation_results["valid_transactions"].append(transaction)
                
            except Exception as e:
                validation_results["validation_errors"].append({
                    "row": i + 1,
                    "error": str(e),
                    "transaction": transaction
                })
        
        # Update parsed data with validation results
        parsed_data.update(validation_results)
        parsed_data["valid_count"] = len(validation_results["valid_transactions"])
        parsed_data["invalid_count"] = len(validation_results["invalid_transactions"])
        parsed_data["duplicate_count"] = len(validation_results["duplicate_transactions"])
        
        return parsed_data
    
    async def _check_transaction_duplicate(self, connection_id: str, transaction_id: str) -> bool:
        """Check if transaction already exists in database"""
        if not self.db:
            return False
        
        try:
            from sqlalchemy import select, and_
            result = await self.db.execute(
                select(BankTransaction).where(
                    and_(
                        BankTransaction.connection_id == connection_id,
                        BankTransaction.transaction_id == transaction_id
                    )
                )
            )
            return result.scalar_one_or_none() is not None
            
        except Exception as e:
            logger.error(f"Error checking transaction duplicate: {e}")
            return False