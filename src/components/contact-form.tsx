'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { FormData as FormDefinition } from '@/lib/types';
import { Icon } from './icon';

export function ContactForm({ form, labels, preview }: { form: FormDefinition; labels: Record<string, string>; preview: boolean }) {
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const status = useRef<HTMLDivElement>(null);
  const active = form.is_active !== false;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (sending || !active) return;
    const htmlData = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.fields.map(field => [field.name, field.type === 'checkbox' ? htmlData.has(field.name) : String(htmlData.get(field.name) || '')]));
    setSending(true); setErrors({}); setMessage('');
    try {
      const origin = (process.env.NEXT_PUBLIC_CMS_ORIGIN || 'https://mediumpurple-jay-763780.hostingersite.com').replace(/\/$/, '');
      const response = await fetch(`${origin}/api/v1/forms/${encodeURIComponent(form.locale)}/${encodeURIComponent(form.slug)}/submissions`, {
        method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ data, website: htmlData.get('website') || '' }), signal: AbortSignal.timeout(15000),
      });
      const result = await response.json() as { message?: string; errors?: Record<string, string[]> };
      if (!response.ok) { setErrors(result.errors || {}); setMessage(result.errors ? '' : labels.form_error || result.message || ''); }
      else { setSuccess(true); setMessage(result.message || form.success_message); }
      requestAnimationFrame(() => status.current?.focus());
    } catch { setMessage(labels.form_error || ''); }
    finally { setSending(false); }
  }
  return <div className="contact-form-wrap">
    <div ref={status} tabIndex={-1} role={success ? 'status' : 'alert'} className={success ? 'form-success' : 'form-status'}>
      {success && <span><Icon name="circlecheck" size={30} /></span>}{message && <p>{message}</p>}
      {!!Object.keys(errors).length && <ul>{Object.entries(errors).map(([key, values]) => <li key={key}>{values.join(' ')}</li>)}</ul>}
    </div>
    {!success && <form onSubmit={submit} className="contact-form">
      <div className="form-grid">{form.fields.map(field => {
        const error = errors['data.' + field.name];
        const id = `${form.slug}-${field.name}`;
        const props = { id, name: field.name, required: field.required, 'aria-invalid': !!error, 'aria-describedby': error ? id + '-error' : undefined, disabled: sending };
        return <div className={`form-field ${field.type === 'textarea' || field.type === 'checkbox' ? 'full-width' : ''}`} key={field.name}>
          {field.type === 'checkbox' ? <label className="checkbox-label"><input {...props} type="checkbox" /><span>{field.label}{field.required && <em>*</em>}</span></label> : <><label htmlFor={id}>{field.label}{field.required && <em>*</em>}</label>
            {field.type === 'textarea' ? <textarea {...props} rows={4} /> : field.type === 'select' ? <select {...props} defaultValue=""><option value="" disabled>{field.label}</option>{field.options?.map(option => <option key={option} value={option}>{option}</option>)}</select>
              : <input {...props} type={['email', 'tel', 'date'].includes(field.type) ? field.type : 'text'} autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.name === 'name' ? 'name' : undefined} />}</>}
          {error && <small className="field-error" id={id + '-error'}>{error.join(' ')}</small>}
        </div>;
      })}</div>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button type="submit" className="button button-primary form-submit" disabled={sending || !active}><span>{sending ? labels.form_sending : form.submit_label}</span><Icon name={sending ? 'activity' : 'arrow'} size={19} /></button>
      {!active && <p className="form-notice">{preview ? labels.preview_form_notice : labels.form_unavailable}</p>}
    </form>}
  </div>;
}
