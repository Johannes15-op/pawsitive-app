import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import kaponService from '../services/kaponService';
import { auth } from '../config/firebaseConfig';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import KaponForm from './KaponForm';

const KaponSchedule = ({ currentScreen, setCurrentScreen, showSidebar, setShowSidebar }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [kapons, setKapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadKapons();
  }, []);

  const loadKapons = async () => {
    try {
      setLoading(true);
      const result = await kaponService.getActiveSchedules();
      if (result.success) {
        setKapons(result.data);
      }
    } catch (error) {
      console.error('Error loading kapons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getKaponsForDate = (day) => {
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return kapons.filter(kapon => {
      const kaponDate = new Date(kapon.date);
      return isSameDay(dateToCheck, kaponDate);
    });
  };

  const handleDateClick = (day) => {
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const eventsOnDay = getKaponsForDate(day);
    if (eventsOnDay.length > 0) {
      setSelectedDate(dateToCheck);
    }
  };

  const handleRegisterClick = (kapon) => {
    if (!currentUser) {
      setCurrentScreen('login');
      return;
    }

    if (kapon.registeredCount >= kapon.capacity) {
      alert('Sorry, this event is fully booked.');
      return;
    }

    setSelectedSchedule(kapon);
    setShowRegistrationForm(true);
  };

  const selectedKapons = selectedDate ? getKaponsForDate(selectedDate.getDate()) : [];
  const upcomingEvent = kapons.length > 0 ? kapons[0] : null;

  const days = [];
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  
  if (showRegistrationForm && selectedSchedule) {
    return (
      <KaponForm
        currentScreen="kaponForm"
        setCurrentScreen={(screen) => {
          if (screen === 'kapon') {
            setShowRegistrationForm(false);
            setSelectedSchedule(null);
            loadKapons();
          } else {
            setCurrentScreen(screen);
          }
        }}
        setShowSidebar={setShowSidebar}
        selectedSchedule={selectedSchedule}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
       {}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <button onClick={() => setShowSidebar(true)} className="p-2">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-2">
          <Heart className="text-pink-500 fill-pink-500" size={24} />
          <span className="font-semibold text-lg text-gray-800">Kapon Schedule</span>
        </div>

        <div className="w-10"></div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading schedules...</p>
          </div>
        ) : (
          <>
            {}
            {upcomingEvent && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border-l-4 border-pink-500">
                <h3 className="font-semibold text-pink-600 mb-3 text-sm">FREE KAPON SCHEDULE ANNOUNCEMENT!</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Good news, pet owners! 🐕<br/>
                  {upcomingEvent.description}
                </p>

                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="bg-pink-500 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                      {new Date(upcomingEvent.date).getDate()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{upcomingEvent.title}</h4>
                      <div className="space-y-1 text-xs text-gray-600 mt-2">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{upcomingEvent.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🕐</span>
                          <span>{upcomingEvent.startTime} - {upcomingEvent.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>👥</span>
                          <span>
                            {upcomingEvent.registeredCount}/{upcomingEvent.capacity} registered
                            {upcomingEvent.registeredCount >= upcomingEvent.capacity && (
                              <span className="ml-1 text-red-600">Limited slots available</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRegisterClick(upcomingEvent)}
                    disabled={upcomingEvent.registeredCount >= upcomingEvent.capacity}
                    className={`w-full py-2 rounded font-semibold text-sm transition ${
                      upcomingEvent.registeredCount >= upcomingEvent.capacity
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                  >
                    {upcomingEvent.registeredCount >= upcomingEvent.capacity ? 'Fully Booked' : 'Register Now'}
                  </button>
                </div>

                {upcomingEvent.requirements && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-800 mb-1">📋 Requirements:</p>
                    <ul className="text-xs text-gray-700 space-y-0.5">
                      {upcomingEvent.requirements.split('\n').map((req, idx) => (
                        <li key={idx}>• {req.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              {}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-pink-500">📅</span>
                  <h2 className="text-base font-semibold text-gray-800">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-1 hover:bg-gray-100 rounded transition"
                  >
                    <ChevronLeft size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1 hover:bg-gray-100 rounded transition"
                  >
                    <ChevronRight size={18} className="text-gray-700" />
                  </button>
                </div>
              </div>

              {}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const kaponEvents = day ? getKaponsForDate(day) : [];
                  const isToday = day && isSameDay(new Date(), new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                  const isSelected = selectedDate && day && isSameDay(selectedDate, new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));

                  return (
                    <button
                      key={index}
                      onClick={() => day && handleDateClick(day)}
                      disabled={!day || kaponEvents.length === 0}
                      className={`aspect-square flex flex-col items-center justify-center rounded text-xs font-medium transition ${
                        !day
                          ? 'bg-transparent cursor-default'
                          : isSelected
                          ? 'bg-pink-500 text-white font-bold'
                          : isToday
                          ? 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                          : kaponEvents.length > 0
                          ? 'bg-pink-100 text-pink-900 border-2 border-pink-500 cursor-pointer hover:bg-pink-200'
                          : 'bg-gray-50 text-gray-400 cursor-default'
                      }`}
                    >
                      <span>{day}</span>
                      {kaponEvents.length > 0 && (
                        <span className={`text-lg ${isSelected || isToday ? 'text-white' : 'text-pink-500'}`}>
                          •
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-pink-100 border border-pink-500 rounded"></div>
                  <span>Main Event</span>
                </div>
              </div>
            </div>

            {}
            {selectedDate && selectedKapons.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Events on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h3>
                <div className="space-y-3">
                  {selectedKapons.map(kapon => (
                    <div key={kapon.id} className="border-l-4 border-pink-500 pl-3 py-2">
                      <h4 className="font-semibold text-gray-800 text-sm">{kapon.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{kapon.description}</p>
                      
                      <div className="space-y-1 mt-2 text-xs text-gray-600">
                        <div>🕐 {kapon.startTime} - {kapon.endTime}</div>
                        <div>📍 {kapon.location}</div>
                        <div>👥 {kapon.registeredCount}/{kapon.capacity} registered</div>
                      </div>

                      <button
                        onClick={() => handleRegisterClick(kapon)}
                        disabled={kapon.registeredCount >= kapon.capacity}
                        className={`w-full mt-2 py-2 rounded font-semibold text-sm transition ${
                          kapon.registeredCount >= kapon.capacity
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-pink-500 text-white hover:bg-pink-600'
                        }`}
                      >
                        {kapon.registeredCount >= kapon.capacity ? 'Fully Booked' : 'Register Now'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kapons.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Heart className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-gray-500">No upcoming Kapon events scheduled yet.</p>
              </div>
            )}
          </>
        )}
      </div>

      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        setCurrentScreen={setCurrentScreen}
      />
      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

export default KaponSchedule;