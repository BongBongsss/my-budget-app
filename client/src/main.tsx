import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

type ValidatableControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const isValidatableControl = (target: EventTarget | null): target is ValidatableControl =>
  target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement;

const getKoreanValidationMessage = (control: ValidatableControl) => {
  const { validity } = control;
  const lengthControl = control as HTMLInputElement | HTMLTextAreaElement;
  const rangeControl = control as HTMLInputElement;
  if (validity.valueMissing) return '필수 입력 항목입니다.';
  if (validity.typeMismatch || validity.patternMismatch) return '입력 형식을 확인해 주세요.';
  if (validity.tooShort) return `최소 ${lengthControl.minLength}자 이상 입력해 주세요.`;
  if (validity.tooLong) return `최대 ${lengthControl.maxLength}자까지 입력할 수 있습니다.`;
  if (validity.rangeUnderflow) return `${rangeControl.min} 이상으로 입력해 주세요.`;
  if (validity.rangeOverflow) return `${rangeControl.max} 이하로 입력해 주세요.`;
  if (validity.stepMismatch) return '허용된 단위에 맞춰 입력해 주세요.';
  if (validity.badInput) return '올바른 값을 입력해 주세요.';
  return '입력값을 확인해 주세요.';
};

// Browser-native validation follows the browser language by default. Keep the
// existing native UI but provide consistent Korean messages across all forms.
document.addEventListener('invalid', (event) => {
  if (!isValidatableControl(event.target)) return;
  event.target.setCustomValidity('');
  event.target.setCustomValidity(getKoreanValidationMessage(event.target));
}, true);

const clearCustomValidation = (event: Event) => {
  if (isValidatableControl(event.target)) event.target.setCustomValidity('');
};
document.addEventListener('input', clearCustomValidation, true);
document.addEventListener('change', clearCustomValidation, true);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
