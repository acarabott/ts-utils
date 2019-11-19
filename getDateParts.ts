const pad = (num: number) => `${num}`.padStart(2, "0");

export const getDateParts = (date: Date) => {
  const parts = {
    fullYear: `${date.getFullYear()}`,
    year: `${date.getFullYear()}`.slice(2),
    month: pad(date.getMonth()),
    day: pad(date.getDate() + 1),
    hour: pad(date.getHours()),
    minutes: pad(date.getMinutes()),
    seconds: pad(date.getSeconds()),
    time(delim = ":") {
      return `${parts.hour}${delim}${parts.minutes}${delim}${parts.seconds}`;
    },
    date(delim = "-") {
      return `${parts.day}${delim}${parts.month}${delim}${parts.year}`;
    },
    dateFull(delim = "-") {
      return `${parts.day}${delim}${parts.month}${delim}${parts.fullYear}`;
    },
    revDate(delim = "-") {
      return `${parts.year}${delim}${parts.month}${delim}${parts.day}`;
    },
  };

  return parts;
};
