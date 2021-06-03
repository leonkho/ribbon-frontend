import { BigNumber } from "ethers";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAssets,
  VaultList,
  VaultOptions,
} from "shared/lib/constants/constants";
import usePendingTransactions from "../../hooks/usePendingTransactions";
import useVaultData from "shared/lib/hooks/useVaultData";
import { useWeb3Context } from "shared/lib/hooks/web3Context";
import { PendingTransaction } from "shared/lib/store/types";
import { getAssetDecimals, getAssetDisplay } from "shared/lib/utils/asset";
import { getDefaultNetworkName } from "shared/lib/utils/env";
import { formatBigNumber } from "shared/lib/utils/math";
import { capitalize } from "../../utils/text";
import { productCopies } from "shared/lib/components/Product/productCopies";
import Toast from "shared/lib/components/Common/BaseToast";

export const WrongNetworkToast = () => {
  const [showToast, setShowToast] = useState(false);
  const [shownOnce, setShownOnce] = useState(false);
  const { status, error } = useVaultData(VaultList[0]);
  const networkName = capitalize(getDefaultNetworkName());

  useEffect(() => {
    if (status === "error" && error === "wrong_network" && !shownOnce) {
      setShowToast(true);
      setShownOnce(true);
    }
  }, [status, error, setShowToast, shownOnce]);

  const onClose = useCallback(() => {
    setShowToast(false);
  }, [setShowToast]);

  return (
    <Toast
      show={showToast}
      onClose={onClose}
      type="error"
      title="wrong network"
      subtitle={`Please switch to ${networkName}`}
    ></Toast>
  );
};

type TxStatuses = "success" | "error" | null;

export const TxStatusToast = () => {
  const [pendingTransactions, setPendingTransactions] =
    usePendingTransactions();

  const [status, setStatus] = useState<TxStatuses>(null);
  const [currentTx, setCurrentTx] = useState<PendingTransaction | null>(null);
  const { provider } = useWeb3Context();

  useEffect(() => {
    if (provider && pendingTransactions.length) {
      (async () => {
        // we query from the tail of the pendingTransactions
        const tailTx = pendingTransactions[pendingTransactions.length - 1];
        const receipt = await provider.waitForTransaction(tailTx.txhash, 1);

        setStatus(receipt.status ? "success" : "error");
        setCurrentTx(tailTx);
        setPendingTransactions((pendingTransactions) => {
          return pendingTransactions.filter(
            (tx) => tx.txhash !== tailTx.txhash
          );
        });
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTransactions, setStatus, setCurrentTx]);

  const toast = useMemo(() => {
    if (!status || !currentTx) {
      return null;
    }

    const { type, amount } = currentTx;
    // @ts-ignore
    const vault: VaultOptions | undefined = currentTx.vault;
    // @ts-ignore
    const stakeAsset: VaultOptions | undefined = currentTx.stakeAsset;

    const asset = vault ? getAssets(vault) : undefined;
    const amountFormatted: string = vault
      ? formatBigNumber(BigNumber.from(amount), 6, getAssetDecimals(asset!))
      : amount;

    if (status === "error") {
      return (
        <Toast
          show={status === "error"}
          onClose={() => setStatus(null)}
          type="error"
          title={`${type} failed`}
          subtitle={
            type === "approval"
              ? `Please try approving ${
                  asset ? getAssetDisplay(asset) : stakeAsset!
                } again`
              : "Please resubmit transaction"
          }
        ></Toast>
      );
    }

    const word = capitalize(type);
    let subtitle: string = "";

    switch (type) {
      case "approval":
        subtitle = `Your ${
          // @ts-ignore
          asset ? getAssetDisplay(asset) : stakeAsset
        } is ready to ${
          // @ts-ignore
          asset ? "deposit" : "stake"
        }`;
        break;
      case "withdraw":
        subtitle = `${amountFormatted} ${getAssetDisplay(
          asset!
        )} withdrawn into ${productCopies[vault!].title}`;
        break;
      case "deposit":
        subtitle = `${amountFormatted} ${getAssetDisplay(
          asset!
        )} deposited from ${productCopies[vault!].title}`;
        break;
      case "claim":
        subtitle = `${amountFormatted} $RBN claimed`;
        break;
      case "stake":
        subtitle = `${amountFormatted} ${stakeAsset} staked`;
        break;
      case "unstake":
        subtitle = `${amountFormatted} ${stakeAsset} unstaked`;
    }

    return (
      <Toast
        show={status === "success"}
        onClose={() => setStatus(null)}
        type={type === "claim" ? "claim" : "success"}
        title={`${word} successful`}
        subtitle={subtitle}
      ></Toast>
    );
  }, [status, currentTx]);

  return toast;
};
