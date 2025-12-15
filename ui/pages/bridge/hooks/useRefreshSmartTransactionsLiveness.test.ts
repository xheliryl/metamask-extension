import { renderHook } from '@testing-library/react-hooks';
import * as reactRedux from 'react-redux';
import { CHAIN_IDS } from '@metamask/transaction-controller';
import { useRefreshSmartTransactionsLiveness } from './useRefreshSmartTransactionsLiveness';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../../../store/actions', () => ({
  fetchSmartTransactionsLiveness: jest.fn(() => ({ type: 'MOCK_ACTION' })),
}));

const mockFetchSmartTransactionsLiveness = jest.requireMock(
  '../../../store/actions',
).fetchSmartTransactionsLiveness;

describe('useRefreshSmartTransactionsLiveness', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (reactRedux.useDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('does not dispatch when fromChain is null', () => {
    renderHook(() => useRefreshSmartTransactionsLiveness(null));
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch when fromChain is undefined', () => {
    renderHook(() => useRefreshSmartTransactionsLiveness(undefined));
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch for non-EVM chains', () => {
    renderHook(() =>
      useRefreshSmartTransactionsLiveness({ chainId: 'solana:mainnet' }),
    );
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch for unsupported EVM chains', () => {
    renderHook(() => useRefreshSmartTransactionsLiveness({ chainId: '0x999' }));
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('dispatches fetchSmartTransactionsLiveness for mainnet', () => {
    renderHook(() =>
      useRefreshSmartTransactionsLiveness({ chainId: CHAIN_IDS.MAINNET }),
    );
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockFetchSmartTransactionsLiveness).toHaveBeenCalled();
  });

  it('re-dispatches when chainId changes to another supported chain', () => {
    const { rerender } = renderHook<{ chainId: string }, void>(
      ({ chainId }) => useRefreshSmartTransactionsLiveness({ chainId }),
      { initialProps: { chainId: CHAIN_IDS.MAINNET } },
    );

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    // BSC is in both production and development allowed lists
    rerender({ chainId: CHAIN_IDS.BSC });
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });
});
