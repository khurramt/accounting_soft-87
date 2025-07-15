#!/bin/bash

# Set the API URL
API_URL="https://a0594035-ee12-4fe8-b64d-3b8a258db8bd.preview.emergentagent.com/api"
echo "Using API URL: $API_URL"

# Set the access token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjZjYzM1NjctMzk1My00NDQzLWE2Y2MtYzk3MGFlYjFlNTljIiwic2Vzc2lvbl9pZCI6IjFhMjk0MmI4LTMyN2UtNDdjYy05MWZiLTM2MGQ5Y2EyYzBhMCIsImV4cCI6MTc1MjAwNTU0MiwiaWF0IjoxNzUyMDA0NjQyLCJ0eXBlIjoiYWNjZXNzIn0.klzOEYqf8Sf9qCmhqN1rgc23ogQfexohSlASwALVqhA"

# Generate a timestamp for unique names
TIMESTAMP=$(date +%Y%m%d%H%M%S)

echo -e "\n🔍 Starting QuickBooks Clone Company Management API tests..."
echo "🕒 Test time: $(date +'%Y-%m-%d %H:%M:%S')"

# Test 1: List companies
echo -e "\n🔍 Testing GET /api/companies - List companies..."
LIST_RESPONSE=$(wget --no-check-certificate -qO- --header="Authorization: Bearer $TOKEN" $API_URL/companies/)
echo "Response: $LIST_RESPONSE"
if [[ $LIST_RESPONSE == \[* ]]; then
    echo "✅ List companies test passed"
    LIST_TEST_RESULT="PASS"
else
    echo "❌ List companies test failed"
    LIST_TEST_RESULT="FAIL"
fi

# Test 2: Create company
echo -e "\n🔍 Testing POST /api/companies - Create company..."
CREATE_PAYLOAD='{
    "company_name": "Test Company '$TIMESTAMP'",
    "company_type": "corporation",
    "industry": "technology",
    "address_line1": "123 Test St",
    "city": "Test City",
    "state": "TS",
    "zip_code": "12345",
    "country": "US",
    "phone": "555-123-4567",
    "email": "test.company.'$TIMESTAMP'@example.com",
    "website": "https://example.com",
    "fiscal_year_start": "2025-01-01",
    "tax_year_start": "2025-01-01",
    "currency": "USD",
    "language": "en-US"
}'
CREATE_RESPONSE=$(wget --no-check-certificate -qO- --header="Authorization: Bearer $TOKEN" --header="Content-Type: application/json" --post-data="$CREATE_PAYLOAD" $API_URL/companies/)
echo "Response: $CREATE_RESPONSE"

# Extract company_id from response
COMPANY_ID=$(echo $CREATE_RESPONSE | grep -o '"company_id":"[^"]*' | cut -d'"' -f4)

if [[ -n "$COMPANY_ID" ]]; then
    echo "✅ Create company test passed (ID: $COMPANY_ID)"
    CREATE_TEST_RESULT="PASS"
else
    echo "❌ Create company test failed"
    CREATE_TEST_RESULT="FAIL"
    echo "❌ No company ID available, skipping company-specific tests"
    exit 1
fi

# Test 3: Get company by ID
echo -e "\n🔍 Testing GET /api/companies/$COMPANY_ID - Get company details..."
GET_RESPONSE=$(wget --no-check-certificate -qO- --header="Authorization: Bearer $TOKEN" $API_URL/companies/$COMPANY_ID)
echo "Response: $GET_RESPONSE"
if [[ $GET_RESPONSE == *"$COMPANY_ID"* ]]; then
    echo "✅ Get company by ID test passed"
    GET_TEST_RESULT="PASS"
else
    echo "❌ Get company by ID test failed"
    GET_TEST_RESULT="FAIL"
fi

# Test 4: Update company
echo -e "\n🔍 Testing PUT /api/companies/$COMPANY_ID - Update company..."
UPDATE_PAYLOAD='{
    "company_name": "Updated Company '$TIMESTAMP'",
    "phone": "555-987-6543",
    "address_line1": "456 Updated St",
    "website": "https://updated-example.com"
}'
UPDATE_RESPONSE=$(wget --no-check-certificate -qO- --header="Authorization: Bearer $TOKEN" --header="Content-Type: application/json" --method=PUT --body-data="$UPDATE_PAYLOAD" $API_URL/companies/$COMPANY_ID)
echo "Response: $UPDATE_RESPONSE"
if [[ $UPDATE_RESPONSE == *"Updated Company"* && $UPDATE_RESPONSE == *"$COMPANY_ID"* ]]; then
    echo "✅ Update company test passed"
    UPDATE_TEST_RESULT="PASS"
else
    echo "❌ Update company test failed"
    UPDATE_TEST_RESULT="FAIL"
fi

# Test 5: Get company settings
echo -e "\n🔍 Testing GET /api/companies/$COMPANY_ID/settings - Get company settings..."
SETTINGS_RESPONSE=$(wget --no-check-certificate -qO- --header="Authorization: Bearer $TOKEN" $API_URL/companies/$COMPANY_ID/settings)
echo "Response: $SETTINGS_RESPONSE"
if [[ $SETTINGS_RESPONSE == \[* ]]; then
    echo "✅ Get company settings test passed"
    GET_SETTINGS_TEST_RESULT="PASS"
else
    echo "❌ Get company settings test failed"
    GET_SETTINGS_TEST_RESULT="FAIL"
fi

# Test 6: Update company settings
echo -e "\n🔍 Testing PUT /api/companies/$COMPANY_ID/settings - Update company settings..."
SETTINGS_PAYLOAD='{
    "settings": [
        {
            "category": "general",
            "setting_key": "default_currency",
            "setting_value": {"value": "USD"}
        },
        {
            "category": "general",
            "setting_key": "default_language",
            "setting_value": {"value": "en-US"}
        },
        {
            "category": "invoicing",
            "setting_key": "default_terms",
            "setting_value": {"value": "Net 30"}
        }
    ]
}'
UPDATE_SETTINGS_RESPONSE=$(wget --no-check-certificate -qO- --header="Authorization: Bearer $TOKEN" --header="Content-Type: application/json" --method=PUT --body-data="$SETTINGS_PAYLOAD" $API_URL/companies/$COMPANY_ID/settings)
echo "Response: $UPDATE_SETTINGS_RESPONSE"
if [[ $UPDATE_SETTINGS_RESPONSE == \[* ]]; then
    echo "✅ Update company settings test passed"
    UPDATE_SETTINGS_TEST_RESULT="PASS"
else
    echo "❌ Update company settings test failed"
    UPDATE_SETTINGS_TEST_RESULT="FAIL"
fi

# Test 7: Delete company
echo -e "\n🔍 Testing DELETE /api/companies/$COMPANY_ID - Delete company..."
DELETE_RESPONSE=$(wget --no-check-certificate -qO- --header="Authorization: Bearer $TOKEN" --method=DELETE $API_URL/companies/$COMPANY_ID)
echo "Response: $DELETE_RESPONSE"
if [[ $DELETE_RESPONSE == *"deleted"* ]]; then
    echo "✅ Delete company test passed"
    DELETE_TEST_RESULT="PASS"
else
    echo "❌ Delete company test failed"
    DELETE_TEST_RESULT="FAIL"
fi

# Print summary
echo -e "\n📋 Company Management API Test Summary:"
echo "List companies: $LIST_TEST_RESULT"
echo "Create company: $CREATE_TEST_RESULT"
echo "Get company by ID: $GET_TEST_RESULT"
echo "Update company: $UPDATE_TEST_RESULT"
echo "Get company settings: $GET_SETTINGS_TEST_RESULT"
echo "Update company settings: $UPDATE_SETTINGS_TEST_RESULT"
echo "Delete company: $DELETE_TEST_RESULT"

# Check if all tests passed
if [[ "$LIST_TEST_RESULT" == "PASS" && 
      "$CREATE_TEST_RESULT" == "PASS" && 
      "$GET_TEST_RESULT" == "PASS" && 
      "$UPDATE_TEST_RESULT" == "PASS" && 
      "$GET_SETTINGS_TEST_RESULT" == "PASS" && 
      "$UPDATE_SETTINGS_TEST_RESULT" == "PASS" && 
      "$DELETE_TEST_RESULT" == "PASS" ]]; then
    echo -e "\n✅ All tests passed!"
    exit 0
else
    echo -e "\n❌ Some tests failed!"
    exit 1
fi