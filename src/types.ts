/** Selection granularity of the picker. */
export type DatepickerType = 'date' | 'month' | 'year'

/** Values the component accepts as input for a single date. */
export type DateInput = Date | string | number | null | undefined

/** A resolved single value emitted by the component. */
export type SingleValue = Date | null

/** A resolved range value emitted by the component: `[start, end]`. */
export type RangeValue = [Date | null, Date | null]

/** Union of the two possible model shapes. */
export type DatepickerModel = SingleValue | RangeValue

/** Predicate used to disable individual selectable units. */
export type DisabledDateFn = (date: Date, type: DatepickerType) => boolean

/** Internal calendar view, from the most detailed to the broadest. */
export type CalendarView = 'days' | 'months' | 'years'
