import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const WidgetCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.25rem;
  height: 100%;
  min-height: ${props => (props.compact ? 'auto' : '280px')};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const WidgetTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.base};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const NavBtn = styled.button`
  padding: 0.35rem;
  border: none;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const MonthLabel = styled.span`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  min-width: 100px;
  text-align: center;
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 0.75rem;
`;

const DayHeader = styled.div`
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  padding: 0.25rem 0;
`;

const DayCell = styled.div`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.fontSize.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => (props.hasEvent ? `${props.theme.colors.primary}18` : 'transparent')};
  color: ${props => (props.hasEvent ? props.theme.colors.primary : props.theme.colors.text)};
  font-weight: ${props => (props.hasEvent ? props.theme.fontWeight.semibold : 'inherit')};
`;

const EventsList = styled.div`
  margin-top: 0.75rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: 0.75rem;
  max-height: ${props => (props.compact ? '140px' : '200px')};
  overflow-y: auto;
`;

const EventItem = styled.a`
  display: block;
  padding: 0.4rem 0;
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  border-radius: ${props => props.theme.borderRadius.sm};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const EventDate = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  margin-right: 0.5rem;
`;

const Empty = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthStart(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getMonthEnd(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function getCalendarDays(year, month) {
  const start = getMonthStart(new Date(year, month));
  const end = getMonthEnd(new Date(year, month));
  const startDay = start.getDay();
  const daysInMonth = end.getDate();
  const prevMonth = new Date(year, month, 0);
  const prevDays = prevMonth.getDate();
  const rows = [];
  let row = Array(7).fill(null);
  let dayCount = 0;
  for (let i = 0; i < startDay; i++) {
    row[i] = { day: prevDays - startDay + i + 1, current: false };
    dayCount++;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    row[dayCount % 7] = { day: d, current: true };
    dayCount++;
    if (dayCount % 7 === 0) {
      rows.push(row);
      row = Array(7).fill(null);
    }
  }
  if (dayCount % 7 !== 0) {
    let next = 1;
    for (let i = dayCount % 7; i < 7; i++) {
      row[i] = { day: next++, current: false };
    }
    rows.push(row);
  }
  return rows;
}

export default function LaunchesCalendar({ events = [], compact = false }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const eventsByDate = useMemo(() => {
    const map = {};
    (events || []).forEach((e) => {
      const d = e.date;
      if (!d) return;
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return map;
  }, [events]);

  const calendarRows = useMemo(() => getCalendarDays(year, month), [year, month]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));

  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (events || [])
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, compact ? 5 : 10);
  }, [events, compact]);

  return (
    <WidgetCard compact={compact}>
      <Header>
        <WidgetTitle>
          <CalendarIcon size={18} />
          Launches calendar
        </WidgetTitle>
        <Nav>
          <NavBtn onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </NavBtn>
          <MonthLabel>{monthLabel}</MonthLabel>
          <NavBtn onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </NavBtn>
        </Nav>
      </Header>
      <WeekGrid>
        {WEEKDAYS.map((d) => (
          <DayHeader key={d}>{d}</DayHeader>
        ))}
        {calendarRows.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            if (!cell) return <DayCell key={`${rowIdx}-${colIdx}`} />;
            const dateKey = cell.current
              ? `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
              : null;
            const hasEvent = dateKey && eventsByDate[dateKey]?.length > 0;
            return (
              <DayCell key={`${rowIdx}-${colIdx}-${cell.day}`} hasEvent={hasEvent}>
                {cell.day}
              </DayCell>
            );
          })
        )}
      </WeekGrid>
      <EventsList compact={compact}>
        {upcomingEvents.length === 0 ? (
          <Empty>No upcoming events.</Empty>
        ) : (
          upcomingEvents.map((e) => (
            <EventItem
              key={e.id}
              href={e.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              title={e.title}
            >
              <EventDate>{e.date}</EventDate>
              {e.title}
            </EventItem>
          ))
        )}
      </EventsList>
    </WidgetCard>
  );
}
