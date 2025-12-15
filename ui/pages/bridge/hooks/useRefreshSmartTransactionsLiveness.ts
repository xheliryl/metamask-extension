import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAllowedSmartTransactionsChainIds } from '../../../../shared/constants/smartTransactions';
import { fetchSmartTransactionsLiveness } from '../../../store/actions';
import { isNonEvmChain } from '../../../ducks/bridge/utils';

type Chain = {
  chainId: string;
};

/**
 * Hook that fetches smart transactions liveness for a given chain.
 * Ensures fresh liveness data is fetched when entering the page
 * and when the chain changes.
 *
 * @param fromChain - The source chain to fetch liveness for
 */
export function useRefreshSmartTransactionsLiveness(
  fromChain: Chain | null | undefined,
): void {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!fromChain?.chainId) {
      return;
    }

    if (isNonEvmChain(fromChain.chainId)) {
      return;
    }

    const chainSupportsSTX = getAllowedSmartTransactionsChainIds().includes(
      fromChain.chainId,
    );

    if (chainSupportsSTX) {
      dispatch(fetchSmartTransactionsLiveness());
    }
  }, [fromChain?.chainId, dispatch]);
}

