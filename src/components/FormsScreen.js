import React, { useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import { CheckCircle, FileText, Calendar, PawPrint, Scissors } from 'lucide-react';

const FormsScreen = ({ currentScreen, setCurrentScreen, setShowSidebar }) => {
  const [activeTab, setActiveTab] = useState('application');

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Header 
        title="Information" 
        setCurrentScreen={setCurrentScreen}
        setShowSidebar={setShowSidebar}
      />

      <div className="pt-16 p-4">
        {}
        <div className="flex mb-4 gap-2">
          <button 
            onClick={() => setActiveTab('application')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'application' 
                ? 'bg-pink-500 text-white' 
                : 'bg-pink-100 text-pink-600'
            }`}
          >
            Adoption Info
          </button>
          <button 
            onClick={() => setActiveTab('kapon')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'kapon' 
                ? 'bg-pink-500 text-white' 
                : 'bg-pink-100 text-pink-600'
            }`}
          >
            Kapon Info
          </button>
        </div>

        {}
        {activeTab === 'application' && (
          <div className="space-y-4">
            {}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <PawPrint className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Pet Adoption Requirements</h2>
              </div>
              <p className="text-white/90">
                Thank you for your interest in adopting a pet! Please review the requirements and process below.
              </p>
            </div>

           {}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-500" />
                Required Documents & Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Valid ID</p>
                    <p className="text-sm text-gray-600">Government-issued ID for verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Proof of Residence</p>
                    <p className="text-sm text-gray-600">Utility bill or lease agreement</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Personal Information</p>
                    <p className="text-sm text-gray-600">Full name, age, occupation, and contact details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Home Visit Consent</p>
                    <p className="text-sm text-gray-600">Agreement for pre-adoption home inspection</p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                Adoption Process
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Submit Application</p>
                    <p className="text-sm text-gray-600">Fill out the adoption application form with complete information</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Interview & Screening</p>
                    <p className="text-sm text-gray-600">Our team will contact you for an interview and background check</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Home Visit</p>
                    <p className="text-sm text-gray-600">We'll visit your home to ensure it's suitable for the pet</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Adoption Approval</p>
                    <p className="text-sm text-gray-600">Receive approval and schedule pet pickup</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Welcome Your New Pet!</p>
                    <p className="text-sm text-gray-600">Complete the adoption and bring your new family member home</p>
                  </div>
                </div>
              </div>
            </div>

           

            {}
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg shadow-sm p-6 border border-pink-200">
              <p className="text-center text-gray-700 mb-4">
                Ready to give a loving home to a pet in need?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setCurrentScreen('pets')}
                  className="flex-1 bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  Browse Available Pets
                </button>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'kapon' && (
          <div className="space-y-4">
            {}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Scissors className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Spay/Neuter Program</h2>
              </div>
              <p className="text-white/90">
                Help control the pet population and improve your pet's health through our spay/neuter program.
              </p>
            </div>

            {}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-pink-500" />
                Benefits of Spaying/Neutering
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Health Benefits</p>
                    <p className="text-sm text-gray-600">Reduces risk of certain cancers and infections</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Behavioral Improvement</p>
                    <p className="text-sm text-gray-600">Reduces aggression, roaming, and marking behavior</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Population Control</p>
                    <p className="text-sm text-gray-600">Prevents unwanted litters and reduces stray animals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Cost-Effective</p>
                    <p className="text-sm text-gray-600">Affordable or free services for qualified pet owners</p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-500" />
                What You Need
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Pet Information</p>
                    <p className="text-sm text-gray-600">Name, breed, age, and gender of your pet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Owner Contact Details</p>
                    <p className="text-sm text-gray-600">Full name and contact number</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Pet Must Be Healthy</p>
                    <p className="text-sm text-gray-600">Pet should be in good health for surgery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Age Requirement</p>
                    <p className="text-sm text-gray-600">Pets should be at least 6 months old</p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Schedule an Appointment</p>
                    <p className="text-sm text-gray-600">Contact us to book a spay/neuter appointment</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Pre-Surgery Instructions</p>
                    <p className="text-sm text-gray-600">Follow fasting and care instructions before surgery</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Surgery Day</p>
                    <p className="text-sm text-gray-600">Bring your pet for the procedure</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Recovery & Follow-up</p>
                    <p className="text-sm text-gray-600">Take your pet home with post-surgery care instructions</p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg shadow-sm p-6 border border-pink-200">
              <p className="text-center text-gray-700 mb-4">
                Ready to schedule your pet's spay/neuter appointment?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setCurrentScreen('kaponSchedule')}
                  className="flex-1 bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  View Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

export default FormsScreen;