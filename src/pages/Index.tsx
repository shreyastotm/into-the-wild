
import React from 'react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-4xl font-bold text-center mb-6">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600 text-center max-w-2xl mb-8">
          This is a clean starting point for your project. Feel free to modify and build upon this foundation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="default" size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
