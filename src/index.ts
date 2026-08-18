import type { App, Plugin } from 'vue'
import './components/datepicker.css'
import EffizDatepicker from './components/EffizDatepicker.vue'
import EffizCalendar from './components/EffizCalendar.vue'

export { EffizDatepicker, EffizCalendar }

export type {
  DatepickerType,
  DateInput,
  SingleValue,
  RangeValue,
  DatepickerModel,
  DisabledDateFn,
  CalendarView,
} from './types'

export {
  toDate,
  formatValue,
  normalizeToType,
  isSameDay,
  isSameMonth,
  isSameYear,
} from './utils/date'

/**
 * Vue plugin registering the components globally as
 * `<EffizDatepicker>` and `<EffizCalendar>`.
 *
 * ```ts
 * import { EffizDatepickerPlugin } from '@effiz/datepicker'
 * import '@effiz/datepicker/style.css'
 * app.use(EffizDatepickerPlugin)
 * ```
 */
export const EffizDatepickerPlugin: Plugin = {
  install(app: App) {
    app.component('EffizDatepicker', EffizDatepicker)
    app.component('EffizCalendar', EffizCalendar)
  },
}

export default EffizDatepickerPlugin
