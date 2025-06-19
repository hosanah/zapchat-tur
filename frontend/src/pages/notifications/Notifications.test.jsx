import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Notifications from './Notifications';
import { ToastProvider } from '../../contexts/ToastContext';
import { notificationService } from '../../services/api';

jest.mock('../../services/api', () => ({
  notificationService: {
    list: jest.fn(),
    markRead: jest.fn(),
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <Notifications />
    </ToastProvider>
  );

test('renders notifications list', async () => {
  notificationService.list.mockResolvedValue({ data: { notifications: [ { id: '1', content: 'Hello', read: false } ] } });
  renderPage();
  expect(await screen.findByText('Hello')).toBeInTheDocument();
});

test('marks notification as read', async () => {
  notificationService.list.mockResolvedValue({ data: { notifications: [ { id: '1', content: 'Hello', read: false } ] } });
  notificationService.markRead.mockResolvedValue({});
  renderPage();
  const button = await screen.findByRole('button', { name: /ler/i });
  await userEvent.click(button);
  expect(notificationService.markRead).toHaveBeenCalledWith('1');
});
