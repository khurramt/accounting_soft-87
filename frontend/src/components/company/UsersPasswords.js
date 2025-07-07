import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit, Trash2, Key, Shield, User, Settings } from 'lucide-react';

const UsersPasswords = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@company.com',
      role: 'Admin',
      accessLevel: 'All Areas',
      status: 'Active',
      lastLogin: '2024-01-15 10:30 AM',
      createdDate: '2024-01-01'
    },
    {
      id: 2,
      username: 'accountant',
      fullName: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'Accountant',
      accessLevel: 'Accounting Only',
      status: 'Active',
      lastLogin: '2024-01-14 2:15 PM',
      createdDate: '2024-01-05'
    },
    {
      id: 3,
      username: 'sales',
      fullName: 'John Doe',
      email: 'john.doe@company.com',
      role: 'Sales',
      accessLevel: 'Sales & Customers',
      status: 'Inactive',
      lastLogin: '2024-01-10 9:45 AM',
      createdDate: '2024-01-03'
    }
  ]);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    role: '',
    accessLevel: '',
    password: '',
    confirmPassword: ''
  });

  const accessLevels = [
    'All Areas',
    'Accounting Only',
    'Sales & Customers',
    'Vendors & Purchases',
    'Inventory Only',
    'Reports Only',
    'Time Tracking Only',
    'Custom Access'
  ];

  const roles = [
    'Admin',
    'Accountant',
    'Sales',
    'Manager',
    'Bookkeeper',
    'Viewer'
  ];

  const handleAddUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const user = {
      id: users.length + 1,
      ...newUser,
      status: 'Active',
      lastLogin: 'Never',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, user]);
    setNewUser({
      username: '',
      fullName: '',
      email: '',
      role: '',
      accessLevel: '',
      password: '',
      confirmPassword: ''
    });
    setIsAddUserOpen(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      accessLevel: user.accessLevel,
      password: '',
      confirmPassword: ''
    });
  };

  const handleUpdateUser = () => {
    const updatedUsers = users.map(user => 
      user.id === editingUser.id 
        ? { ...user, ...newUser, password: undefined, confirmPassword: undefined }
        : user
    );
    setUsers(updatedUsers);
    setEditingUser(null);
    setNewUser({
      username: '',
      fullName: '',
      email: '',
      role: '',
      accessLevel: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    );
    setUsers(updatedUsers);
  };

  const resetUserPassword = (userId) => {
    const newPassword = prompt('Enter new password for user:');
    if (newPassword) {
      alert(`Password reset successfully for user ID ${userId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Passwords</h1>
          <p className="text-gray-600">Manage user accounts and access permissions</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level
                  </label>
                  <select
                    value={newUser.accessLevel}
                    onChange={(e) => setNewUser({...newUser, accessLevel: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Access Level</option>
                    {accessLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            User Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Username</th>
                  <th className="text-left p-2">Full Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Access Level</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Last Login</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{user.username}</td>
                    <td className="p-2">{user.fullName}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{user.accessLevel}</Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={user.status === 'Active' ? 'success' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-2">{user.lastLogin}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          className="p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetUserPassword(user.id)}
                          className="p-1"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(user.id)}
                          className="p-1"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Edit User Dialog */}
      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Level
                </label>
                <select
                  value={newUser.accessLevel}
                  onChange={(e) => setNewUser({...newUser, accessLevel: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {accessLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Control Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Access Control Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-medium">{users.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Users:</span>
                <span className="font-medium">{users.filter(u => u.status === 'Active').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Admin Users:</span>
                <span className="font-medium">{users.filter(u => u.role === 'Admin').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Full Access:</span>
                <span className="font-medium">{users.filter(u => u.accessLevel === 'All Areas').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Password Policy:</span>
                <Badge variant="outline">Strong</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Session Timeout:</span>
                <span className="font-medium">2 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Two-Factor Auth:</span>
                <Badge variant="secondary">Optional</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Login Attempts:</span>
                <span className="font-medium">5 max</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersPasswords;