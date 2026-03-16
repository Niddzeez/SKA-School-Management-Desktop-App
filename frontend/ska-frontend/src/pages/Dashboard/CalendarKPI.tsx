import React, { useEffect, useState } from "react";
import "./calendarKPI.css";

const API_KEY = "kIEUWyJJ2MJIkn2TnApLvXt4TeAnJLSQ";
const COUNTRY = "IN";

interface Holiday {
  name: string;
  date: string;
}

interface EventItem {
  date: string;
  title: string;
  note: string;
}

interface CalendarificHoliday {
  name: string;
  date: { iso: string };
}

const WEEKDAY_LABELS: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarKPI(): React.ReactElement {
  const today = new Date();
  const todayISO: string = today.toISOString().split("T")[0];

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [title, setTitle] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Today's display values
  const todayDayName: string = today.toLocaleDateString("en-IN", { weekday: "long" });
  const todayFull: string = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Freeze background scroll when modal open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    };
  }, [showModal]);

  // Load saved events
  useEffect(() => {
    const stored: string | null = localStorage.getItem("calendarEvents");
    if (stored) setEvents(JSON.parse(stored) as EventItem[]);
  }, []);

  // Persist events
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  // Fetch Indian holidays
  useEffect(() => {
    fetch(
      `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${COUNTRY}&year=${currentYear}`
    )
      .then((res: Response) => res.json())
      .then((data: { response: { holidays: CalendarificHoliday[] } }) => {
        const formatted: Holiday[] = data.response.holidays.map(
          (h: CalendarificHoliday) => ({
            name: h.name,
            date: h.date.iso,
          })
        );
        setHolidays(formatted);
      })
      .catch(console.error);
  }, [currentYear]);

  const daysInMonth: number = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay: number = new Date(currentYear, currentMonth, 1).getDay();

  const monthName: string = new Date(currentYear, currentMonth).toLocaleString("en-IN", {
    month: "long",
  });

  const saveEvent = (): void => {
    if (!title.trim()) return;
    setEvents([...events, { date: selectedDate, title, note }]);
    setTitle("");
    setNote("");
    setShowModal(false);
  };

  const prevMonth = (): void => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = (): void => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthHolidays: Holiday[] = holidays.filter(
    (h: Holiday) =>
      new Date(h.date).getMonth() === currentMonth &&
      new Date(h.date).getFullYear() === currentYear
  );

  const monthEvents: EventItem[] = events.filter(
    (e: EventItem) =>
      new Date(e.date).getMonth() === currentMonth &&
      new Date(e.date).getFullYear() === currentYear
  );

  const totalEvents = [...monthEvents, ...monthHolidays];

  return (
    <>
      {/* Modal — rendered outside the card */}
      {showModal && (
        <div
          className="cal-modal-overlay"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            setShowModal(false);
          }}
          style={{ pointerEvents: "all" }}
        >
          <div
            className="cal-modal"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            style={{ pointerEvents: "all" }}
          >
            <div className="cal-modal-header">Add Event</div>
            <div className="cal-modal-date">{selectedDate}</div>

            <input
              className="cal-modal-input"
              placeholder="Event title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
            />

            <textarea
              className="cal-modal-textarea"
              placeholder="Notes (optional)"
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
            />

            <div className="cal-modal-actions">
              <button className="cal-btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="cal-btn-save" onClick={saveEvent}>
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CALENDAR CARD ── */}
      <div className="cal-card">

        {/* ── SECTION 1: Current Date ── */}
        <div className="cal-today-banner">
          <div className="cal-today-dayname">{todayDayName}</div>
          <div className="cal-today-full">{todayFull}</div>
        </div>

        <div className="cal-divider" />

        {/* ── SECTION 2: Month Navigation ── */}
        <div className="cal-month-nav">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <span className="cal-month-label">{monthName} {currentYear}</span>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
        </div>

        {/* ── SECTION 3: Calendar Grid ── */}
        <div className="cal-grid">
          {/* Weekday headers */}
          {WEEKDAY_LABELS.map((d: string, i: number) => (
            <div key={`lbl-${i}`} className="cal-weekday-label">
              {d.charAt(0)}
            </div>
          ))}

          {/* Empty leading cells */}
          {Array(firstDay)
            .fill(null)
            .map((_: null, i: number) => (
              <div key={`blank-${i}`} className="cal-day-cell cal-day-blank" />
            ))}

          {/* Day cells */}
          {Array(daysInMonth)
            .fill(null)
            .map((_: null, i: number) => {
              const dayNum: number = i + 1;
              const fullDate: string = new Date(currentYear, currentMonth, dayNum)
                .toISOString()
                .split("T")[0];

              const hasEvent: boolean = events.some((e: EventItem) => e.date === fullDate);
              const isHoliday: boolean = holidays.some((h: Holiday) => h.date === fullDate);
              const isToday: boolean = fullDate === todayISO;

              let cellClass = "cal-day-cell";
              if (isToday) cellClass += " cal-today";
              else if (hasEvent && isHoliday) cellClass += " cal-both";
              else if (hasEvent) cellClass += " cal-personal";
              else if (isHoliday) cellClass += " cal-holiday";

              return (
                <div
                  key={`day-${dayNum}`}
                  className={cellClass}
                  onClick={() => {
                    setSelectedDate(fullDate);
                    setShowModal(true);
                  }}
                >
                  <span className="cal-day-num">{dayNum}</span>
                  {(hasEvent || isHoliday) && (
                    <span
                      className={`cal-dot ${
                        isToday
                          ? "cal-dot-today"
                          : hasEvent && isHoliday
                          ? "cal-dot-both"
                          : hasEvent
                          ? "cal-dot-personal"
                          : "cal-dot-holiday"
                      }`}
                    />
                  )}
                </div>
              );
            })}
        </div>

        <div className="cal-divider" />

        {/* ── SECTION 4: Upcoming Events ── */}
        <div className="cal-events-section">
          <div className="cal-events-title">Upcoming Events</div>

          {totalEvents.length === 0 ? (
            <div className="cal-no-events">No events this month</div>
          ) : (
            <div className="cal-events-list">
              {monthEvents.map((e: EventItem, i: number) => (
                <div key={`ev-${i}`} className="cal-event-row">
                  <span className="cal-event-dot cal-event-dot-personal" />
                  <span className="cal-event-text">
                    {new Date(e.date).getDate()} – {e.title}
                  </span>
                </div>
              ))}
              {monthHolidays.map((h: Holiday, i: number) => (
                <div key={`hol-${i}`} className="cal-event-row">
                  <span className="cal-event-dot cal-event-dot-holiday" />
                  <span className="cal-event-text">
                    {new Date(h.date).getDate()} – {h.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default CalendarKPI;