import s from './Toast.module.css'
export default function Toast({ msg }) {
  return <div className={s.toast}>{msg}</div>
}
