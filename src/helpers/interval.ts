import { format, isAfter, parse } from 'date-fns'

export const intervalRegEx = /^\d{1,2}\.\d{2}\.\d{2} \d{1,2}:\d{2}-\d{1,2}:\d{2}$/
export const humanFormat = 'дд.мм.гг чч:мм-чч:мм'

export class IntervalError extends Error {}

export class InvalidIntervalFormatError extends IntervalError {
  constructor() {
    super(`Неправильный формат. Я умею понимать только ${humanFormat}`)
  }
}

export class InvalidIntervalDirectionError extends IntervalError {
  constructor() {
    super('Сначала должно быть начало, потом конец')
  }
}

export function parseInterval(input: string): [Date, Date] {
  if (!intervalRegEx.test(input)) {
    throw new InvalidIntervalFormatError()
  }

  const [startDateStr, endTimeStr] = input.split('-')

  const start = parse(startDateStr, 'd.L.yy H:mm', new Date())
  const end = parse(endTimeStr, 'H:mm', start)

  if (!isAfter(end, start)) {
    throw new InvalidIntervalDirectionError()
  }

  return [start, end]
}

export function stringifyInterval(start: Date, end: Date): string {
  return `${format(start, 'd.LL.yy HH:mm')}-${format(end, 'HH:mm')}`
}
