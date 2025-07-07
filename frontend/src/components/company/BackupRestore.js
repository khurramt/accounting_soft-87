import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Download, Upload, Save, FolderOpen, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const BackupRestore = () => {
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupLocation, setBackupLocation] = useState('C:\\QuickBooksBackups\\');
  const [selectedFile, setSelectedFile] = useState('');
  
  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      filename: 'Demo_Company_2024-01-15_10-30.qbb',
      date: '2024-01-15',
      time: '10:30 AM',
      size: '45.2 MB',
      type: 'Automatic',
      status: 'Completed'
    },
    {
      id: 2,
      filename: 'Demo_Company_2024-01-14_18-00.qbb',
      date: '2024-01-14',
      time: '6:00 PM',
      size: '44.8 MB',
      type: 'Scheduled',
      status: 'Completed'
    },
    {
      id: 3,
      filename: 'Demo_Company_2024-01-13_09-15.qbb',
      date: '2024-01-13',
      time: '9:15 AM',
      size: '43.9 MB',
      type: 'Manual',
      status: 'Completed'
    },
    {
      id: 4,
      filename: 'Demo_Company_2024-01-12_17-45.qbb',
      date: '2024-01-12',
      time: '5:45 PM',
      size: '44.1 MB',
      type: 'Automatic',
      status: 'Failed'
    }
  ]);

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'Daily',
    backupTime: '18:00',
    maxBackups: 10,
    verifyBackup: true,
    compressBackup: true,
    includeAttachments: true
  });

  const handleCreateBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simulate backup process
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          
          // Add new backup to history
          const newBackup = {
            id: backupHistory.length + 1,
            filename: `Demo_Company_${new Date().toISOString().split('T')[0]}_${new Date().toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')}.qbb`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US'),
            size: '45.6 MB',
            type: 'Manual',
            status: 'Completed'
          };
          
          setBackupHistory([newBackup, ...backupHistory]);
          alert('Backup created successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleRestoreBackup = () => {
    if (!selectedFile) {
      alert('Please select a backup file to restore');
      return;
    }
    
    if (!window.confirm('Are you sure you want to restore from this backup? This will replace your current data.')) {
      return;
    }
    
    setIsRestoring(true);
    setRestoreProgress(0);
    
    // Simulate restore process
    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRestoring(false);
          alert('Backup restored successfully!');
          return 100;
        }
        return prev + 8;
      });
    }, 600);
  };

  const handleBrowseBackupLocation = () => {
    // In a real application, this would open a file dialog
    const newLocation = prompt('Enter backup location:', backupLocation);
    if (newLocation) {
      setBackupLocation(newLocation);
    }
  };

  const handleFileSelect = () => {
    // In a real application, this would open a file browser
    const filename = prompt('Enter backup filename to restore:');
    if (filename) {
      setSelectedFile(filename);
    }
  };

  const deleteBackup = (backupId) => {
    if (window.confirm('Are you sure you want to delete this backup?')) {
      setBackupHistory(backupHistory.filter(backup => backup.id !== backupId));
    }
  };

  const downloadBackup = (backup) => {
    // In a real application, this would trigger a download
    alert(`Downloading ${backup.filename}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-600">Manage your company data backups and restoration</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isBackingUp ? 'Creating...' : 'Create Backup'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Create Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Location
              </label>
              <div className="flex space-x-2">
                <Input
                  value={backupLocation}
                  onChange={(e) => setBackupLocation(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleBrowseBackupLocation}
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verifyBackup"
                  checked={backupSettings.verifyBackup}
                  onChange={(e) => setBackupSettings({
                    ...backupSettings,
                    verifyBackup: e.target.checked
                  })}
                  className="mr-2"
                />
                <label htmlFor="verifyBackup" className="text-sm text-gray-700">
                  Verify backup after creation
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="compressBackup"
                  checked={backupSettings.compressBackup}
                  onChange={(e) => setBackupSettings({
                    ...backupSettings,
                    compressBackup: e.target.checked
                  })}
                  className="mr-2"
                />
                <label htmlFor="compressBackup" className="text-sm text-gray-700">
                  Compress backup file
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeAttachments"
                  checked={backupSettings.includeAttachments}
                  onChange={(e) => setBackupSettings({
                    ...backupSettings,
                    includeAttachments: e.target.checked
                  })}
                  className="mr-2"
                />
                <label htmlFor="includeAttachments" className="text-sm text-gray-700">
                  Include attachments
                </label>
              </div>
            </div>

            {isBackingUp && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Creating backup...</span>
                  <span>{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="w-full" />
              </div>
            )}

            <div className="bg-yellow-50 p-3 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Backup will temporarily close your company file
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restore Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Restore Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Backup File
              </label>
              <div className="flex space-x-2">
                <Input
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  placeholder="Choose backup file to restore"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleFileSelect}
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {isRestoring && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Restoring backup...</span>
                  <span>{restoreProgress}%</span>
                </div>
                <Progress value={restoreProgress} className="w-full" />
              </div>
            )}

            <div className="bg-red-50 p-3 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800">
                  Restoring will replace all current data
                </span>
              </div>
            </div>

            <Button
              onClick={handleRestoreBackup}
              disabled={isRestoring || !selectedFile}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isRestoring ? 'Restoring...' : 'Restore Backup'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Automatic Backup Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Frequency
              </label>
              <select
                value={backupSettings.backupFrequency}
                onChange={(e) => setBackupSettings({
                  ...backupSettings,
                  backupFrequency: e.target.value
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Never">Never</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Time
              </label>
              <Input
                type="time"
                value={backupSettings.backupTime}
                onChange={(e) => setBackupSettings({
                  ...backupSettings,
                  backupTime: e.target.value
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Backups to Keep
              </label>
              <Input
                type="number"
                value={backupSettings.maxBackups}
                onChange={(e) => setBackupSettings({
                  ...backupSettings,
                  maxBackups: parseInt(e.target.value)
                })}
                min="1"
                max="50"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoBackup"
                checked={backupSettings.autoBackup}
                onChange={(e) => setBackupSettings({
                  ...backupSettings,
                  autoBackup: e.target.checked
                })}
                className="mr-2"
              />
              <label htmlFor="autoBackup" className="text-sm text-gray-700">
                Enable automatic backups
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Filename</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Size</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backupHistory.map(backup => (
                  <tr key={backup.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{backup.filename}</td>
                    <td className="p-2">{backup.date}</td>
                    <td className="p-2">{backup.time}</td>
                    <td className="p-2">{backup.size}</td>
                    <td className="p-2">
                      <Badge variant={backup.type === 'Manual' ? 'default' : 'secondary'}>
                        {backup.type}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={backup.status === 'Completed' ? 'success' : 'destructive'}>
                        {backup.status === 'Completed' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {backup.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadBackup(backup)}
                          className="p-1"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedFile(backup.filename)}
                          className="p-1"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteBackup(backup.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupRestore;