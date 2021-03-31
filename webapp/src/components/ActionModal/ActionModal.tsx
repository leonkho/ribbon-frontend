import React, { useState } from "react";
import styled from "styled-components";
import MobileOverlayMenu from "../Common/MobileOverlayMenu";
import colors from "../../designSystem/colors";
import { Title } from "../../designSystem";
import ActionSteps from "./ActionSteps";
import { PreviewStepProps, StepData } from "./types";

const ModalNavigation = styled.div`
  position: absolute;
  top: 28px;
  left: 14px;
`;

const ArrowBack = styled.i`
  color: ${colors.primaryText};
  height: 14px;
  margin-right: 20px;
`;

const ModalBody = styled.div<ModalProps>`
  background: #1c1a19;
  border: 1px solid #2b2b2b;
  box-sizing: border-box;
  border-radius: 8px;
  width: ${(props) => (props.variant === "desktop" ? "383px" : "100%")};
  max-width: 450px;
  min-height: 450px;
  max-height: 450px;
`;

const ModalTitle = styled.div`
  background: #151413;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding-top: 20px;
  padding-bottom: 20px;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-left: 16px;
  padding-right: 16px;
`;

const CloseButton = styled.i`
  flex: 0;
  paddingright: 20px;
`;

const StyledActionSteps = styled(ActionSteps)`
  width: 100%;
`;

interface ModalProps {
  variant: "desktop" | "mobile";
}

interface ActionModalProps extends ModalProps {
  show: boolean;
  onClose: () => void;
  previewStepProps?: PreviewStepProps;
}

const ActionModal: React.FC<ActionModalProps> = ({
  show,
  onClose,
  variant,
  previewStepProps,
}) => {
  const [stepData, setStepData] = useState<StepData>({
    stepNum: 0,
    title: "",
    navigationButton: "back",
  });
  const isDesktop = variant === "desktop";

  return (
    <MobileOverlayMenu
      isMenuOpen={show}
      onOverlayClick={() => {}}
      mountRoot="div#root"
      boundingDivProps={{
        style: {
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <>
        <ModalNavigation className="d-flex flex-row align-items-center">
          {!isDesktop && (
            <div onClick={onClose}>
              <ArrowBack className="fas fa-arrow-left"></ArrowBack>
              <Title>Back</Title>
            </div>
          )}
        </ModalNavigation>
        <ModalBody variant={variant}>
          <ModalTitle className="d-flex align-items-center justify-content-center">
            <Title style={{ flex: 1 }}>{stepData.title}</Title>
            <CloseButton
              onClick={onClose}
              className="fas fa-times align-self-center text-white"
            ></CloseButton>
          </ModalTitle>

          <ModalContent>
            <ActionSteps
              className="w-100"
              skipToPreview={isDesktop}
              show={show}
              onClose={onClose}
              onChangeStep={(stepData) => setStepData(stepData)}
              previewStepProps={previewStepProps}
            ></ActionSteps>
          </ModalContent>
        </ModalBody>
      </>
    </MobileOverlayMenu>
  );
};

export default ActionModal;
