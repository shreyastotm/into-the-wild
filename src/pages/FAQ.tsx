import React from 'react';
import FAQ from '@/components/FAQ';

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600">
            Find answers to common questions about Into the Wild and our trekking adventures.
          </p>
        </div>

        <FAQ />
      </div>
    </div>
  );
}
