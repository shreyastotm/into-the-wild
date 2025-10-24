import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calendar, Users } from "lucide-react";

const TrekkingGuide = () => {
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
              <BookOpen className="h-12 w-12 text-blue-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">
                Trekking Guide
              </h1>
            </div>
            <p className="text-xl text-gray-600">
              Your comprehensive guide to trekking in India
            </p>
          </div>

          {/* Coming Soon Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're working on creating a comprehensive trekking guide that will
              help you prepare for your adventures. This guide will include
              everything from basic trekking tips to advanced techniques.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Planning Your Trek
                </h3>
                <p className="text-sm text-gray-600">
                  Learn how to choose the right trek for your skill level and
                  plan your adventure.
                </p>
              </div>
              <div className="text-center p-4">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Safety Guidelines
                </h3>
                <p className="text-sm text-gray-600">
                  Essential safety tips and guidelines for a safe trekking
                  experience.
                </p>
              </div>
              <div className="text-center p-4">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Equipment Guide
                </h3>
                <p className="text-sm text-gray-600">
                  Complete guide to trekking equipment and gear recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Current Treks
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
            <p className="text-gray-600 mb-2">Have questions about trekking?</p>
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

export default TrekkingGuide;
