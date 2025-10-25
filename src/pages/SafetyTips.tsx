import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, Heart, Users } from "lucide-react";

const SafetyTips = () => {
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
              <Shield className="h-12 w-12 text-red-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">Safety Tips</h1>
            </div>
            <p className="text-xl text-gray-600">
              Essential safety guidelines for your trekking adventures
            </p>
          </div>

          {/* Coming Soon Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're developing comprehensive safety guidelines to ensure your
              trekking experience is both enjoyable and safe. Our safety guide
              will cover all aspects of trekking safety.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Emergency Procedures
                </h3>
                <p className="text-sm text-gray-600">
                  What to do in case of emergencies and how to stay safe in
                  challenging situations.
                </p>
              </div>
              <div className="text-center p-4">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Health & Fitness
                </h3>
                <p className="text-sm text-gray-600">
                  Health considerations and fitness requirements for different
                  trek levels.
                </p>
              </div>
              <div className="text-center p-4">
                <Users className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Group Safety
                </h3>
                <p className="text-sm text-gray-600">
                  Safety protocols for group treks and how to look out for
                  fellow trekkers.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Safe Treks
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
            <p className="text-gray-600 mb-2">
              Need immediate safety information?
            </p>
            <p className="text-sm text-gray-500">
              Contact our safety team at{" "}
              <a
                href="mailto:safety@intothewild.com"
                className="text-blue-600 hover:text-blue-700"
              >
                safety@intothewild.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyTips;
