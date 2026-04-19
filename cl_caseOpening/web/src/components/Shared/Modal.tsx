import { ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { motion, AnimatePresence } from "motion/react";
import { useMainService } from "@/services/app/main/main.service";
import { useModalService } from "@/services/modal/modal.service";

import LoadingBtn from "@/components/Shared/LoadingBtn";

const shouldShowModal = (
  isOpen: boolean,
  type: string | null | undefined,
  context: string | undefined
): boolean => {
  if (!isOpen || !type) return false;
  if (!context) return true;
  switch (context) {
    default:
      return false;
  }
};

const getModalLoadingText = (_type: string | null | undefined): string =>
  "đang xử lý";

const getModalConfirmButtonId = (type: string | null | undefined): string =>
  `modal-confirm-${type || "unknown"}`;

const renderModalInnerContent = (
  updating: boolean | undefined,
  children: ReactNode | undefined
): ReactNode => {
  if (updating) {
    return (
      <p className="text-white text-[1.65vh] text-center leading-[2.4vh]">
        Đang trong quá trình phát triển...
      </p>
    );
  }
  return children;
};

interface ModalProps {
  context?: string;
  children?: ReactNode;
  width?: string;
  heightContent?: string;
  updating?: boolean;
  onConfirm?: () => void | Promise<void>;
}

const Modal = observer(({ 
  context, 
  children, 
  width = "w-[22vw]",
  heightContent = "max-h-[40vh]",
  updating, 
  onConfirm 
}: ModalProps) => {
  const modalService = useModalService();
  const mainService = useMainService();

  const {
    isOpen,
    type,
    title,
    closeModal
  } = modalService;

  const readOnlyModalTypes = ['']

  const isWarning = type === 'self-action-warning' || 
                    type === 'permission-denied' ||
                    updating;

  const isReadOnly = readOnlyModalTypes.includes(type || '');

  return (
    <AnimatePresence>
      {shouldShowModal(isOpen, type, context) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: .25,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000000bf]"
        >
          <motion.div
            initial={{ opacity: 0, scale: .95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .95 }}
            transition={{
              duration: .3,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className={`${width} max-h-[55vh] bg-[#292929ce] rounded-[.75vh] p-[2vh_1.75vh_2vh_1.75vh] border-[.1vh] border-[#4d4d4d]`}
          >
            <div className="w-full h-[3.5vh] border-b-[.1vh] border-b-[#4d4d4d]">
              <h1 className="text-[1.75vh] font-semibold text-white capitalize">{title}</h1>
            </div>
            <div className={`py-[2vh] ${heightContent} overflow-y-auto overflow-x-hidden`}>
              {renderModalInnerContent(updating, children)}
            </div>
            <div className="w-full pt-[2vh] border-t-[.1vh] border-t-[#4d4d4d] flex items-center gap-[1vh]">
              {(isWarning || isReadOnly) ? (
                <button 
                  onClick={closeModal}
                  className="w-full h-[4vh] bg-[#28AC40] rounded-[.5vh] border-none outline-none hover:opacity-75 transition-all duration-250"
                >
                  <span className="text-[1.5vh] font-semibold text-white capitalize">
                    {isReadOnly ? 'đóng' : 'đã hiểu'}
                  </span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={closeModal}
                    className={`
                      w-1/2 h-[4vh] bg-[#555555] rounded-[.5vh] border-none outline-none hover:opacity-75 transition-all duration-250
                      ${mainService.isAnyLoading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-[1.5vh] font-semibold text-white capitalize">hủy bỏ</span>
                  </button>
                  <LoadingBtn
                    title={
                      <span className="text-[1.5vh] font-semibold text-white capitalize">
                        xác nhận
                      </span>
                    }
                    loadingTitle={
                      <span className="text-[1.5vh] font-semibold text-white capitalize">
                        {getModalLoadingText(type)}
                      </span>
                    }
                    buttonId={getModalConfirmButtonId(type)}
                    className="w-1/2 h-[4vh] bg-[#28AC40] rounded-[.5vh] border-none outline-none hover:opacity-75 transition-all duration-250 flex items-center justify-center cursor-pointer"
                    onClick={() => void Promise.resolve(onConfirm?.())}
                  />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default Modal;