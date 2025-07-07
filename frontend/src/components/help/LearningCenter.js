import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  BookOpen, Video, Award, Clock, Users, Star, 
  PlayCircle, CheckCircle, Lock, Download, Search
} from 'lucide-react';

const LearningCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'QuickBooks Fundamentals',
      description: 'Master the basics of QuickBooks accounting software',
      level: 'beginner',
      duration: '4 hours',
      lessons: 12,
      enrolled: 1250,
      rating: 4.8,
      progress: 0,
      instructor: 'Sarah Johnson',
      thumbnail: '/api/placeholder/300/200',
      price: 'Free',
      category: 'Basics',
      topics: ['Setup', 'Navigation', 'Basic Transactions']
    },
    {
      id: 2,
      title: 'Advanced Reporting & Analysis',
      description: 'Create powerful reports and analyze financial data',
      level: 'advanced',
      duration: '6 hours',
      lessons: 18,
      enrolled: 680,
      rating: 4.9,
      progress: 25,
      instructor: 'Michael Chen',
      thumbnail: '/api/placeholder/300/200',
      price: '$99',
      category: 'Reports',
      topics: ['Custom Reports', 'Budgeting', 'Financial Analysis']
    },
    {
      id: 3,
      title: 'Payroll Management Mastery',
      description: 'Complete guide to payroll setup and processing',
      level: 'intermediate',
      duration: '5 hours',
      lessons: 15,
      enrolled: 420,
      rating: 4.7,
      progress: 75,
      instructor: 'Lisa Rodriguez',
      thumbnail: '/api/placeholder/300/200',
      price: '$79',
      category: 'Payroll',
      topics: ['Employee Setup', 'Tax Calculations', 'Compliance']
    },
    {
      id: 4,
      title: 'Inventory & Manufacturing',
      description: 'Manage inventory, assemblies, and manufacturing',
      level: 'intermediate',
      duration: '4.5 hours',
      lessons: 14,
      enrolled: 290,
      rating: 4.6,
      progress: 0,
      instructor: 'David Kim',
      thumbnail: '/api/placeholder/300/200',
      price: '$89',
      category: 'Inventory',
      topics: ['Stock Management', 'Assemblies', 'Cost Tracking']
    }
  ]);

  const [learningPaths, setLearningPaths] = useState([
    {
      id: 1,
      title: 'Complete Bookkeeper Certification',
      description: 'Become a certified QuickBooks bookkeeper',
      courses: [1, 2, 3],
      duration: '15 hours',
      difficulty: 'Beginner to Advanced',
      progress: 33,
      certificate: true,
      badge: 'Certified Bookkeeper'
    },
    {
      id: 2,
      title: 'Small Business Financial Management',
      description: 'Essential skills for small business owners',
      courses: [1, 2],
      duration: '10 hours',
      difficulty: 'Beginner to Intermediate',
      progress: 67,
      certificate: true,
      badge: 'Financial Manager'
    },
    {
      id: 3,
      title: 'QuickBooks Power User',
      description: 'Advanced features and customization',
      courses: [2, 4],
      duration: '10.5 hours',
      difficulty: 'Intermediate to Advanced',
      progress: 15,
      certificate: true,
      badge: 'Power User'
    }
  ]);

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'First Steps',
      description: 'Completed your first course',
      icon: '🎯',
      earned: true,
      earnedDate: '2024-01-10'
    },
    {
      id: 2,
      title: 'Knowledge Seeker',
      description: 'Completed 5 courses',
      icon: '📚',
      earned: false,
      progress: 60
    },
    {
      id: 3,
      title: 'Expert Path',
      description: 'Completed an advanced course',
      icon: '🏆',
      earned: true,
      earnedDate: '2024-01-12'
    },
    {
      id: 4,
      title: 'Certified Professional',
      description: 'Earned your first certification',
      icon: '🎓',
      earned: false,
      progress: 75
    }
  ]);

  const skillLevels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedSkillLevel === 'all' || course.level === selectedSkillLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const enrollInCourse = (courseId) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, progress: course.progress > 0 ? course.progress : 5 }
        : course
    ));
    alert('Successfully enrolled in course!');
  };

  const continueCourse = (courseId) => {
    alert(`Continuing course ${courseId}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Center</h1>
          <p className="text-gray-600">Advance your QuickBooks skills with our comprehensive courses</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Award className="w-4 h-4 mr-2" />
          View Certificates
        </Button>
      </div>

      {/* Learning Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses Completed</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Learned</p>
                <p className="text-2xl font-bold text-gray-900">24.5</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {achievements.filter(a => a.earned).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {skillLevels.map(level => (
                <Button
                  key={level.id}
                  variant={selectedSkillLevel === level.id ? "default" : "outline"}
                  onClick={() => setSelectedSkillLevel(level.id)}
                >
                  {level.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningPaths.map(path => (
              <Card key={path.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{path.title}</h3>
                    {path.certificate && <Award className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="w-full" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{path.duration}</span>
                    <span>{path.difficulty}</span>
                  </div>

                  <Button className="w-full" size="sm">
                    {path.progress > 0 ? 'Continue Path' : 'Start Path'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Available Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                  {course.progress > 0 && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <Progress value={course.progress} className="w-full" />
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <span className="text-lg font-bold text-blue-600">{course.price}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>{course.lessons} lessons</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{course.enrolled} enrolled</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.topics.map(topic => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    Instructor: <span className="font-medium">{course.instructor}</span>
                  </div>

                  {course.progress > 0 ? (
                    <Button 
                      onClick={() => continueCourse(course.id)}
                      className="w-full"
                    >
                      Continue Learning ({course.progress}%)
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => enrollInCourse(course.id)}
                      className="w-full"
                      variant={course.price === 'Free' ? 'default' : 'outline'}
                    >
                      {course.price === 'Free' ? 'Start Free Course' : 'Enroll Now'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map(achievement => (
              <Card key={achievement.id} className={`border ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h3 className="font-semibold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  {achievement.earned ? (
                    <div>
                      <Badge variant="success" className="mb-2">Earned</Badge>
                      <p className="text-xs text-gray-500">
                        Earned on {achievement.earnedDate}
                      </p>
                    </div>
                  ) : achievement.progress ? (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} className="w-full" />
                    </div>
                  ) : (
                    <Badge variant="outline">Locked</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Download className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Practice Files</h3>
            <p className="text-gray-600 mb-4">
              Download sample company files to practice with
            </p>
            <Button variant="outline" className="w-full">
              Download Files
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Study Guides</h3>
            <p className="text-gray-600 mb-4">
              Printable study guides and cheat sheets
            </p>
            <Button variant="outline" className="w-full">
              View Guides
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Study Groups</h3>
            <p className="text-gray-600 mb-4">
              Join study groups with other learners
            </p>
            <Button variant="outline" className="w-full">
              Find Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningCenter;