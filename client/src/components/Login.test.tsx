import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Login from './Login';

const postMock = vi.hoisted(() => vi.fn());

vi.mock('../api', () => ({
  default: { post: postMock },
}));

describe('Login', () => {
  it('submits the selected account and forwards the server role', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    postMock.mockResolvedValue({ data: { role: 'viewer' } });

    render(<Login onLogin={onLogin} />);

    await user.selectOptions(screen.getByRole('combobox'), 'viewer');
    await user.type(document.querySelector('input[type="password"]')!, 'safe-password');
    await user.click(document.querySelector('button[type="submit"]')!);

    expect(postMock).toHaveBeenCalledWith('/login', {
      username: 'viewer',
      password: 'safe-password',
      rememberMe: false,
    });
    expect(onLogin).toHaveBeenCalledWith('viewer');
  });

  it('keeps the user on the login form when authentication fails', async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    postMock.mockRejectedValue(new Error('invalid credentials'));

    render(<Login onLogin={vi.fn()} />);

    await user.type(document.querySelector('input[type="password"]')!, 'wrong-password');
    await user.click(document.querySelector('button[type="submit"]')!);

    expect(alertMock).toHaveBeenCalledTimes(1);
  });
});
