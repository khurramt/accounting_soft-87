import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  HelpCircle, Search, Book, Video, MessageCircle, Phone, 
  Mail, ExternalLink, Star, ThumbsUp, ThumbsDown, Play,
  FileText, Users, Settings, Lightbulb, Download
} from 'lucide-react';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [helpArticles, setHelpArticles] = useState([
    {
      id: 1,
      title: 'Getting Started with QuickBooks',
      category: 'basics',
      type: 'article',
      content: 'Learn the fundamentals of QuickBooks accounting software...',
      rating: 4.8,
      views: 1250,
      lastUpdated: '2024-01-10',
      tags: ['beginner', 'setup', 'basics']
    },
    {
      id: 2,
      title: 'Creating Your First Invoice',
      category: 'sales',
      type: 'video',
      content: 'Step-by-step video guide to creating invoices...',
      rating: 4.6,
      views: 980,
      lastUpdated: '2024-01-08',
      tags: ['invoices', 'sales', 'tutorial']
    },
    {
      id: 3,
      title: 'Setting Up Bank Feeds',
      category: 'banking',
      type: 'article',
      content: 'Connect your bank accounts for automatic transaction import...',
      rating: 4.7,
      views: 756,
      lastUpdated: '2024-01-05',
      tags: ['banking', 'automation', 'feeds']
    },
    {
      id: 4,
      title: 'Understanding Financial Reports',
      category: 'reports',
      type: 'video',
      content: 'Learn how to read and interpret QuickBooks reports...',
      rating: 4.9,
      views: 1450,
      lastUpdated: '2024-01-12',
      tags: ['reports', 'analysis', 'financial']
    },
    {
      id: 5,
      title: 'Payroll Setup and Processing',
      category: 'payroll',
      type: 'article',
      content: 'Complete guide to setting up and running payroll...',
      rating: 4.5,
      views: 620,
      lastUpdated: '2024-01-07',
      tags: ['payroll', 'employees', 'taxes']
    }
  ]);

  const [tutorials, setTutorials] = useState([
    {
      id: 1,
      title: 'QuickBooks Basics - 10 Minute Tour',
      duration: '10:35',
      difficulty: 'Beginner',
      thumbnail: '/api/placeholder/320/180',
      description: 'Quick overview of all major QuickBooks features'
    },
    {
      id: 2,
      title: 'Advanced Reporting Techniques',
      duration: '25:40',
      difficulty: 'Advanced',
      thumbnail: '/api/placeholder/320/180',
      description: 'Master custom reports and financial analysis'
    },
    {
      id: 3,
      title: 'Inventory Management Made Easy',
      duration: '18:22',
      difficulty: 'Intermediate',
      thumbnail: '/api/placeholder/320/180',
      description: 'Track inventory, manage stock levels, and automate reordering'
    }
  ]);

  const [faqItems, setFaqItems] = useState([
    {
      id: 1,
      question: 'How do I back up my QuickBooks data?',
      answer: 'You can create a backup by going to File > Create Backup. Choose local backup and follow the prompts to save your company file safely.',
      category: 'data',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: 2,
      question: 'What is the difference between Cash and Accrual accounting?',
      answer: 'Cash accounting records transactions when money actually changes hands, while Accrual accounting records transactions when they occur, regardless of payment timing.',
      category: 'accounting',
      helpful: 67,
      notHelpful: 8
    },
    {
      id: 3,
      question: 'How do I reconcile my bank account?',
      answer: 'Go to Banking > Reconcile Account, enter your statement information, and match transactions. Mark items as cleared when they appear on your bank statement.',
      category: 'banking',
      helpful: 52,
      notHelpful: 5
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'basics', name: 'Getting Started', icon: Book },
    { id: 'sales', name: 'Sales & Invoicing', icon: FileText },
    { id: 'banking', name: 'Banking', icon: Settings },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'payroll', name: 'Payroll', icon: Users }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFeedback = (articleId, isHelpful) => {
    // In a real application, this would send feedback to the server
    alert(`Thank you for your feedback on article ${articleId}!`);
  };

  const openSupportTicket = () => {
    alert('Opening support ticket form...');
  };

  const startLiveChat = () => {
    alert('Connecting to live chat support...');
  };

  const scheduleCall = () => {
    alert('Opening call scheduling system...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600">Find answers, tutorials, and get support</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={startLiveChat} variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Live Chat
          </Button>
          <Button onClick={openSupportTicket} className="bg-blue-600 hover:bg-blue-700">
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search for help articles, tutorials, or FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <category.icon className="w-6 h-6" />
            <span className="text-sm">{category.name}</span>
          </Button>
        ))}
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="support">Get Support</TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Help Articles</h2>
              <span className="text-sm text-gray-600">
                {filteredArticles.length} articles found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map(article => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <Badge variant={article.type === 'video' ? 'default' : 'secondary'}>
                        {article.type === 'video' ? <Video className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                        {article.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{article.content}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span>{article.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{article.views} views</span>
                      </div>
                      <span>Updated {article.lastUpdated}</span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <Button size="sm" className="flex-1 mr-2">
                        Read More
                      </Button>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedback(article.id, true)}
                          className="p-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedback(article.id, false)}
                          className="p-2"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Video Tutorials</h2>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map(tutorial => (
                <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {tutorial.duration}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{tutorial.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{tutorial.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={
                        tutorial.difficulty === 'Beginner' ? 'success' :
                        tutorial.difficulty === 'Intermediate' ? 'default' : 'destructive'
                      }>
                        {tutorial.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">{tutorial.duration}</span>
                    </div>

                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
              <Button variant="outline">
                <Lightbulb className="w-4 h-4 mr-2" />
                Suggest FAQ
              </Button>
            </div>

            <div className="space-y-4">
              {faqItems.map(faq => (
                <Card key={faq.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                    <p className="text-gray-600 mb-4">{faq.answer}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Was this helpful?</span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Yes ({faq.helpful})
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center">
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            No ({faq.notHelpful})
                          </Button>
                        </div>
                      </div>
                      <Badge variant="outline">{faq.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="support">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">
                  Get instant help from our support team. Available 24/7.
                </p>
                <Button onClick={startLiveChat} className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Chat
                </Button>
                <div className="mt-3 text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online - Average wait: 2 minutes
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-4">
                  Speak directly with a QuickBooks expert for complex issues.
                </p>
                <Button onClick={scheduleCall} className="w-full bg-green-600 hover:bg-green-700">
                  Schedule Call
                </Button>
                <div className="mt-3 text-sm text-gray-500">
                  Hours: Mon-Fri 8AM-8PM PST
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">
                  Submit a detailed support ticket and we'll get back to you.
                </p>
                <Button onClick={openSupportTicket} className="w-full bg-purple-600 hover:bg-purple-700">
                  Create Ticket
                </Button>
                <div className="mt-3 text-sm text-gray-500">
                  Response time: 4-6 hours
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Community</h3>
                <p className="text-gray-600 mb-4">
                  Connect with other QuickBooks users and share knowledge.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Community
                </Button>
                <div className="mt-3 text-sm text-gray-500">
                  15,000+ active members
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Book className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Documentation</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive guides and API documentation for developers.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Docs
                </Button>
                <div className="mt-3 text-sm text-gray-500">
                  Developer resources
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">System Status</h3>
                <p className="text-gray-600 mb-4">
                  Check current system status and reported issues.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Status Page
                </Button>
                <div className="mt-3 text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    All systems operational
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpCenter;