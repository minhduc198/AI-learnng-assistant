import { Bell, CheckCircle, Clock, Menu } from "lucide-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import quizService from "../../services/quizService";
import { useQuizzesStore } from "../../stores/quizzesStore";

export default function Header({ toggleSidebar }) {
  const { userInfo } = useProfile();
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);

  const { quizData, updateQuizData } = useQuizzesStore();
  console.log("🚀 ~ Header ~ quizData:", quizData);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await quizService.getAllQuizzes();
        updateQuizData(response.data || []);
      } catch (error) {
        console.error("Failed to fetch quizzes for notifications", error);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uncompletedCount = quizData.filter((q) => !q.completedAt).length;

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60  ">
      <div className="flex items-center justify-between h-full px-6 ">
        {/* Mobile menu btn */}
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex  items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 "
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block"></div>

        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => {
                setIsBellOpen(!isBellOpen);
              }}
              className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
            >
              <Bell
                size={20}
                strokeWidth={2}
                className="group-hover:scale-110 transition-transform duration-200 "
              />
              {uncompletedCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {isBellOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Quiz Notifications
                  </h3>
                  {uncompletedCount > 0 && (
                    <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      {uncompletedCount} New
                    </span>
                  )}
                </div>
                <div className="max-h-[28rem] overflow-y-auto">
                  {quizData.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <Bell size={20} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 text-sm font-medium">
                        No notifications yet
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        When you get quizzes, they'll show up here
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {quizData.map((quiz) => (
                        <Link
                          key={quiz._id}
                          to={
                            quiz.completedAt
                              ? `/quizzes/${quiz._id}/results`
                              : `/quizzes/${quiz._id}`
                          }
                          onClick={() => setIsBellOpen(false)}
                          className={`p-4 hover:bg-slate-50 border-b border-slate-50 flex items-start transition-colors relative ${!quiz.completedAt ? "bg-emerald-50/30" : "bg-white"}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p
                                className={`text-sm truncate capitalize pr-2 ${!quiz.completedAt ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}
                              >
                                {quiz.title}
                              </p>
                              {!quiz.completedAt && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"></div>
                              )}
                            </div>

                            <p className="text-sm capitalize mb-2">
                              {quiz.documentId.title}
                            </p>

                            <div className="flex items-center gap-1.5">
                              {quiz.completedAt ? (
                                <>
                                  <CheckCircle
                                    size={14}
                                    className="text-emerald-500 flex-shrink-0"
                                  />
                                  <span className="text-xs text-slate-600 font-medium">
                                    {Math.round(
                                      (quiz.score / 100) * quiz.totalQuestions,
                                    )}
                                    /{quiz.totalQuestions}
                                  </span>
                                  <span className="text-slate-300 text-[10px] mx-1">
                                    •
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">
                                    {moment(quiz.completedAt).fromNow()}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock
                                    size={14}
                                    className="text-amber-500 flex-shrink-0"
                                  />
                                  <span className="text-xs text-amber-600 font-medium">
                                    Action required
                                  </span>
                                  <span className="text-slate-300 text-[10px] mx-1">
                                    •
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">
                                    {moment(quiz.createdAt).fromNow()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User in4 */}
          <Link
            to={"/profile"}
            className="flex items-center gap-3 pl-3 border-l border-slate-200/60 "
          >
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors duration-200 group cursor-pointer">
              <div className="w-9 h-9 rounded-full overflow-hidden">
                <img className="w-full h-full" src={userInfo.avatar} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {userInfo.username || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  {userInfo.email || "user@example.com"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
