import { useWeb3Wallet } from "../../hooks/useWeb3Wallet";
import React from "react";
import { useHistory } from "react-router";

import Banner from "shared/lib/components/Banner/Banner";
import ProductCatalogue from "shared/lib/components/Product/ProductCatalogue";
import { CHAINID, isProduction } from "shared/lib/utils/env";
import { Title } from "shared/lib/designSystem";
import sizes from "shared/lib/designSystem/sizes";
import styled from "styled-components";
import { ANNOUNCEMENT, getVaultURI } from "../../constants/constants";
import { switchChains } from "shared/lib/utils/chainSwitching";
import useScreenSize from "shared/lib/hooks/useScreenSize";
import { isAvaxNetwork } from "shared/lib/constants/constants";
import { SolanaLogo } from "shared/lib/assets/icons/solAssets";

const ProductTitle = styled(Title)`
  display: none;
  font-size: 24px;
  text-align: center;
  margin-top: 16px;

  @media (max-width: ${sizes.md}px) {
    display: block;
  }
`;

const Homepage = () => {
  const history = useHistory();
  const { ethereumProvider, chainId } = useWeb3Wallet();
  const isMobile = useScreenSize().width <= sizes.md;
  return (
    <>
      <ProductTitle>PRODUCT</ProductTitle>
      <SolanaLogo height={28} width={28}></SolanaLogo>
      {ANNOUNCEMENT && chainId && !isAvaxNetwork(chainId) && (
        <Banner
          color={ANNOUNCEMENT.color}
          message={ANNOUNCEMENT.message}
          linkText={ANNOUNCEMENT.linkText}
          linkURI={ANNOUNCEMENT.linkURI}
          onClick={() => {
            (async () => {
              if (ethereumProvider) {
                await switchChains(
                  ethereumProvider,
                  isProduction() ? CHAINID.AVAX_MAINNET : CHAINID.AVAX_FUJI
                );
                // Mobile wallets normally need to do a hard refresh
                if (isMobile) {
                  window.location.replace("/");
                }
              }
            })();
          }}
        ></Banner>
      )}
      <ProductCatalogue
        variant="webapp"
        onVaultPress={(vault, version) =>
          history.push(getVaultURI(vault, version))
        }
      />
    </>
  );
};

export default Homepage;
