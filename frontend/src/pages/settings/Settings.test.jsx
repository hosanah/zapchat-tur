import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './Settings';
import { ToastProvider } from '../../contexts/ToastContext';
import { settingsService } from '../../services/api';

jest.mock('../../services/api', () => ({
  settingsService: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <Settings />
    </ToastProvider>
  );

test('fetches settings on mount', async () => {
  settingsService.get.mockResolvedValue({ data: { setting: { guidelines: 'foo' } } });
  renderPage();
  expect(settingsService.get).toHaveBeenCalled();
  await screen.findByDisplayValue('foo');
});

test('posts updated data on submit', async () => {
  settingsService.get.mockResolvedValue({ data: { setting: { guidelines: '' } } });
  settingsService.update.mockResolvedValue({});
  renderPage();
  const textarea = await screen.findByRole('textbox');
  await userEvent.type(textarea, 'bar');
  await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
  expect(settingsService.update).toHaveBeenCalledWith({ logo: null, guidelines: 'bar' });
});
