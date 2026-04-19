import { AnimatePresence, motion } from 'motion/react';
import { CaseItem } from '@/types';
import {
  getInventoryImageUrl,
  resolveItemImage,
  getGradientBorderStyle,
  getSharedButtonBackgroundStyleNoDots,
  getCaseRarityDropShadow
} from '@/utils/helpers';
import { useSound } from '@/providers';

import { LoadingBtn } from '@/components/Shared';

const CASE_REWARD_ITEM_WRAPPER_URL =
  '/images/case-reward-item.webp';

export interface ResultOverlayProps {
  isVisible: boolean;
  wonItems: CaseItem[];
  showcaseIndex: number;
  displayedItems: CaseItem[];
  getItemDisplayLabel: (item: CaseItem) => string;
  onClaimAllRewards: () => void | Promise<void>;
}

const ResultOverlay = ({
  isVisible,
  wonItems,
  showcaseIndex,
  displayedItems,
  getItemDisplayLabel,
  onClaimAllRewards
}: ResultOverlayProps): JSX.Element => {
  const { playSound } = useSound();

  const showClaimButton = wonItems.length === 1 || showcaseIndex === -1;
  const showSpaceHint = showcaseIndex >= 0 && wonItems.length > 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: .25,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          className="absolute inset-0 size-full z-[9999] flex flex-col gap-[2.5vh] items-center justify-center bg-[#000000e0]"
        >
          <p className="text-[2.45vh] font-semibold text-white mb-[.25vh]">
            Chúc mừng bạn đã nhận được
          </p>

          {wonItems.length === 1 ? (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 300,
                  duration: 0.6
                }}
                className="flex items-center justify-center w-[21.05vh] h-[21.65vh] bg-no-repeat bg-full-size bg-full-center pt-[.35vh]"
                style={{
                  backgroundImage: `url('${CASE_REWARD_ITEM_WRAPPER_URL}')`
                }}
              >
                <img
                  className="size-[35vh] max-w-[90%] max-h-[90%] object-contain drop-shadow-[0_4px_4px_#00000040]"
                  src={resolveItemImage(
                    wonItems[0].imageUrl,
                    getInventoryImageUrl(wonItems[0].name)
                  )}
                  alt={wonItems[0].name}
                />
              </motion.div>
              <p className="text-[2vh] font-medium text-white">
                {getItemDisplayLabel(wonItems[0])}
              </p>
            </>
          ) : (
            <div className="relative w-full gap-[3vh] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {showcaseIndex >= 0 && showcaseIndex < wonItems.length && (
                  <motion.div
                    key={`showcase-${wonItems[showcaseIndex].name}-${showcaseIndex}`}
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.6,
                      transition: { duration: 0.4 }
                    }}
                    transition={{
                      type: 'spring',
                      damping: 12,
                      stiffness: 200,
                      duration: 0.6
                    }}
                    className="absolute z-10 flex flex-col items-center gap-[1.5vh]"
                  >
                    <div
                      className="flex items-center justify-center w-[21.05vh] h-[21.65vh] bg-no-repeat bg-full-size bg-full-center pt-[.35vh]"
                      style={{
                        backgroundImage: `url('${CASE_REWARD_ITEM_WRAPPER_URL}')`
                      }}
                    >
                      <motion.img
                        animate={{
                          y: [0, -10, 0]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="size-[35vh] max-w-[90%] max-h-[90%] object-contain"
                        src={resolveItemImage(
                          wonItems[showcaseIndex].imageUrl,
                          getInventoryImageUrl(wonItems[showcaseIndex].name)
                        )}
                        alt={wonItems[showcaseIndex].name}
                        style={{
                          filter: getCaseRarityDropShadow(wonItems[showcaseIndex])
                        }}
                      />
                    </div>
                    <p className="text-[2vh] font-medium text-white">
                      {getItemDisplayLabel(wonItems[showcaseIndex])}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                className={`flex ${wonItems.length > 5 ? 'flex-col gap-[2vh]' : 'flex-wrap'} items-center justify-center gap-[2vh] ${wonItems.length > 5 ? 'max-w-[90vh]' : 'max-w-[85vh]'}`}
                animate={{
                  opacity: showcaseIndex >= 0 ? 0.5 : 1
                }}
                transition={{
                  duration: 0.3
                }}
              >
                {wonItems.length > 5 ? (
                  <>
                    <div className="flex items-center justify-center gap-[2vh]">
                      {displayedItems.slice(0, 5).map((item, index) => (
                        <motion.div
                          key={`displayed-${item.name}-${index}`}
                          layoutId={`item-${index}`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: showcaseIndex >= 0 ? 0.5 : 1,
                            scale: 1
                          }}
                          transition={{
                            type: 'spring',
                            damping: 20,
                            stiffness: 300,
                            duration: 0.5
                          }}
                          className="flex flex-col items-center gap-[1vh]"
                        >
                          <div
                            className="flex items-center justify-center w-[12.5vh] h-[13vh] bg-no-repeat bg-full-size bg-full-center pt-[.35vh]"
                            style={{
                              backgroundImage: `url('${CASE_REWARD_ITEM_WRAPPER_URL}')`
                            }}
                          >
                            <img
                              className="max-w-[80%] max-h-[80%] object-contain"
                              src={resolveItemImage(
                                item.imageUrl,
                                getInventoryImageUrl(item.name)
                              )}
                              alt={item.name}
                              style={{
                                filter: getCaseRarityDropShadow(item)
                              }}
                            />
                          </div>
                          <p className="text-[1.4vh] font-medium text-white text-center max-w-[15vh] truncate">
                            {getItemDisplayLabel(item)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-[2vh]">
                      {displayedItems.slice(5, 10).map((item, index) => (
                        <motion.div
                          key={`displayed-${item.name}-${index + 5}`}
                          layoutId={`item-${index + 5}`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: showcaseIndex >= 0 ? 0.5 : 1,
                            scale: 1
                          }}
                          transition={{
                            type: 'spring',
                            damping: 20,
                            stiffness: 300,
                            duration: 0.5
                          }}
                          className="flex flex-col items-center gap-[1vh]"
                        >
                          <div
                            className="flex items-center justify-center w-[12.5vh] h-[13vh] bg-no-repeat bg-full-size bg-full-center pt-[.35vh]"
                            style={{
                              backgroundImage: `url('${CASE_REWARD_ITEM_WRAPPER_URL}')`
                            }}
                          >
                            <img
                              className="max-w-[80%] max-h-[80%] object-contain"
                              src={resolveItemImage(
                                item.imageUrl,
                                getInventoryImageUrl(item.name)
                              )}
                              alt={item.name}
                              style={{
                                filter: getCaseRarityDropShadow(item)
                              }}
                            />
                          </div>
                          <p className="text-[1.4vh] font-medium text-white text-center max-w-[15vh] truncate">
                            {getItemDisplayLabel(item)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  displayedItems.map((item, index) => (
                    <motion.div
                      key={`displayed-${item.name}-${index}`}
                      layoutId={`item-${index}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: showcaseIndex >= 0 ? 0.5 : 1,
                        scale: 1
                      }}
                      transition={{
                        type: 'spring',
                        damping: 20,
                        stiffness: 300,
                        duration: 0.5
                      }}
                      className="flex flex-col items-center gap-[1vh]"
                    >
                      <div
                        className="flex items-center justify-center w-[12.5vh] h-[13vh] bg-no-repeat bg-full-size bg-full-center pt-[.35vh]"
                        style={{
                          backgroundImage: `url('${CASE_REWARD_ITEM_WRAPPER_URL}')`
                        }}
                      >
                        <img
                          className="max-w-[80%] max-h-[80%] object-contain"
                          src={resolveItemImage(
                            item.imageUrl,
                            getInventoryImageUrl(item.name)
                          )}
                          alt={item.name}
                          style={{
                            filter: getCaseRarityDropShadow(item)
                          }}
                        />
                      </div>
                      <p className="text-[1.4vh] font-medium text-white text-center max-w-[15vh] truncate">
                        {getItemDisplayLabel(item)}
                      </p>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>
          )}

          <AnimatePresence>
            {showSpaceHint && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.25,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
                className="absolute bottom-[8vh] text-[1.4vh] font-normal text-[#ffffff80]"
              >
                Nhấn{' '}
                <span className="bg-[#35353580] border-[.1vh] border-[#ffffff40] rounded-[.35vh] px-[.55vh] py-[.35vh] m-[0_.5vh] uppercase">
                  space
                </span>{' '}
                để bỏ qua hiệu ứng
              </motion.p>
            )}
          </AnimatePresence>

          {showClaimButton && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.25,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
            >
              <LoadingBtn
                buttonId="result-overlay-claim-all"
                title="Nhận thưởng"
                loadingTitle="Đang xử lý"
                loadingTextSize="text-[2vh]"
                loadingTextColor="#80FF88"
                className="mt-[.3vh] min-w-[12vh] h-[4.75vh] px-[1.75vh] overflow-hidden rounded-[.45vh] outline-none border-[.1vh] border-transparent cursor-pointer hover:opacity-75 transition-all duration-250 text-[2vh] font-medium text-[#80FF88]"
                style={{
                  ...getGradientBorderStyle('#CDFFCD4D', '#5D845E4D'),
                  backgroundImage:
                    'radial-gradient(82.89% 77.08% at 49.48% 100%, rgba(99, 150, 67, 0.38) 0%, rgba(13, 34, 28, 0.11) 100%), linear-gradient(180deg, rgba(18, 23, 27, 0.00) 0%, rgba(36, 47, 43, 0.70) 100%), linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), linear-gradient(180deg, #CDFFCD4D 0%, #5D845E4D 100%)',
                  ...getSharedButtonBackgroundStyleNoDots()
                }}
                onClick={async () => {
                  playSound('BTN_CLICK');
                  await onClaimAllRewards();
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResultOverlay;
