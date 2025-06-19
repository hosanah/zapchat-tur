import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './Settings';
import { ToastProvider } from '../../contexts/ToastContext';
import { settingService } from '../../services/api';

jest.mock('../../services/api', () => ({
  settingService: {
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
  settingService.get.mockResolvedValue({ data: { setting: { guidelines: 'foo' } } });
  renderPage();
  expect(settingService.get).toHaveBeenCalled();
  await screen.findByDisplayValue('foo');
});

test('posts updated data on submit', async () => {
  settingService.get.mockResolvedValue({ data: { setting: { guidelines: '' } } });
  settingService.update.mockResolvedValue({});
  renderPage();
  const textarea = await screen.findByRole('textbox');
  await userEvent.type(textarea, 'bar');
  await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
  expect(settingService.update).toHaveBeenCalledWith({ guidelines: 'bar' });
});
