import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Backpack,
  CheckSquare,
  Thermometer,
  Sun,
} from "lucide-react";

const PackingList = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center justify-center mb-4">
              <Backpack className="h-12 w-12 text-green-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">Packing List</h1>
            </div>
            <p className="text-xl text-gray-600">
              Essential items for your trekking adventure
            </p>
          </div>

          {/* Coming Soon Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-6xl mb-4">🎒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're creating detailed packing lists for different types of treks
              and weather conditions. Our comprehensive guide will help you pack
              everything you need for a successful adventure.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Essential Items
                </h3>
                <p className="text-sm text-gray-600">
                  Core items every trekker needs, from clothing to safety
                  equipment.
                </p>
              </div>
              <div className="text-center p-4">
                <Thermometer className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Weather-Specific
                </h3>
                <p className="text-sm text-gray-600">
                  Packing lists tailored for different seasons and weather
                  conditions.
                </p>
              </div>
              <div className="text-center p-4">
                <Sun className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Trek Duration
                </h3>
                <p className="text-sm text-gray-600">
                  Different lists for day treks, overnight trips, and multi-day
                  adventures.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button size="lg" className="w-full sm:w-auto">
                View Trek Details
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Return Home
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-2">Need help with packing?</p>
            <p className="text-sm text-gray-500">
              Contact us at{" "}
              <a
                href="mailto:info@intothewild.com"
                className="text-blue-600 hover:text-blue-700"
              >
                info@intothewild.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackingList;
