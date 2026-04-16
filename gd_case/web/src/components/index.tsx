import { useEffect, useState, useRef, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "motion/react";
import { useMainService } from "@/services/app/main/main.service";
import { isEnvBrowser } from "@/utils/misc";
import { formatNumber, getInventoryImageUrl, getCaseItemRarityTier } from "@/utils/helpers";
import { fetchNui } from "@/utils/fetchNui";
import { CaseItem, CaseOpeningState, CaseRarityTier, SelectedAmount } from "@/types";
import { ITEM_WIDTH, ITEM_GAP, ITEMS_TO_GENERATE, IDLE_SPEED_VH, SPIN_DURATION_MS } from "@/constants";
import { ApiResponseData } from "@/types";

import { Image } from "./Shared";
import { CaseSlider, ActionButtons, ResultOverlay } from "./Base";

const ITEM_TOTAL = ITEM_WIDTH + ITEM_GAP;
const getOwnedCaseCount = (
  userItems: Record<string, { name: string; count?: unknown }>,
  caseName?: string
): number => {
  if (!caseName) return 0;
  return Object.values(userItems).reduce((totalCount, userItem) => {
    if (userItem.name === caseName && typeof userItem.count === 'number') {
      return totalCount + userItem.count;
    }
    return totalCount;
  }, 0);
};

const mockCaseClothingItem = (
  rarity: CaseRarityTier,
  percent: number,
  gender: 'male' | 'female' = 'male'
): CaseItem => ({
  name: '308e66381bac52bc',
  gender,
  imageUrl: 'https://cdn.lorax.vn/static/-0-component-4-0-1.webp',
  percent,
  type: 'clothing',
  metadata: { rarity },
});

const createItemDisplayLabelGetter = (getItemLabel: (name: string) => string) => (item: CaseItem): string => {
  if (item.type === 'clothing' && item.gender) {
    return `Trang phục ${item.gender === 'male' ? 'nam' : 'nữ'}`;
  }
  if (item.type === 'item') {
    return getItemLabel(item.name);
  }
  return item.name;
};

const CaseOpening = observer(() => {
  const mainService = useMainService();

  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startOffsetRef = useRef<number>(0);
  const targetOffsetRef = useRef<number>(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  // const sliderRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const awardAudioRef = useRef<HTMLAudioElement | null>(null);
  const shiftedCountRef = useRef<number>(0);
  const targetItemIndexRef = useRef<number>(0);

  const [sliderItems, setSliderItems] = useState<CaseItem[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<SelectedAmount>(1);
  const [wonItems, setWonItems] = useState<CaseItem[]>([]);
  const [showcaseIndex, setShowcaseIndex] = useState<number>(-1);
  const [displayedItems, setDisplayedItems] = useState<CaseItem[]>([]);

  const {
    show,
    caseCollection,
    state,
    finishSpin,
    resetState,
    getItemLabel
  } = mainService;

  const availableItems = caseCollection?.items || [];

  const ownedCaseCount = getOwnedCaseCount(mainService.userItems, caseCollection?.name);
  const canOpen = ownedCaseCount >= selectedAmount;

  const canOpenWithAmount = (amount: SelectedAmount): boolean => {
    return ownedCaseCount >= amount;
  };

  const getItemDisplayLabel = createItemDisplayLabelGetter(getItemLabel);

  const stateRef = useRef<CaseOpeningState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // const resetSelectedCase = () => {
  //   setSelectedAmount(1);
  // };

  useEffect(() => {
    if (!isEnvBrowser()) {
      const handleEscape = async (e: KeyboardEvent) => {
        if (e.key === "Escape" && stateRef.current === 'idle') {
          // resetSelectedCase();
          await fetchNui("main:close");
        }
      };
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, []);

  useEffect(() => {
    if (show) {
      setSelectedAmount(1);
    }
  }, [show]);

  useEffect(() => {
    const spinAudio = new Audio('/sounds/opening.ogg');
    spinAudio.preload = 'auto';
    spinAudio.volume = 1;
    spinAudio.addEventListener('error', () => {
      console.warn('Spin audio failed to load');
    });
    spinAudioRef.current = spinAudio;

    const awardAudio = new Audio('/sounds/opening-award.ogg');
    awardAudio.preload = 'auto';
    awardAudio.volume = 1;
    awardAudio.addEventListener('error', () => {
      console.warn('Award audio failed to load');
    });
    awardAudioRef.current = awardAudio;

    return () => {
      try {
        spinAudio.pause();
        awardAudio.pause();
      } catch {}
      spinAudioRef.current = null;
      awardAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (availableItems.length > 0) {
      const generated: CaseItem[] = [];

      for (let i = 0; i < ITEMS_TO_GENERATE; i++) {
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        const randomItem = availableItems[randomIndex];
        generated.push({...randomItem});
      }

      setSliderItems(generated);
      setOffset(0);
    }
  }, [availableItems]);

  useEffect(() => {
    if (state === 'idle' && sliderItems.length > 0) {
      let lastTime: number | undefined;

      const step = (now: number) => {
        if (lastTime == null) lastTime = now;
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        setOffset(prev => {
          let next = prev - IDLE_SPEED_VH * dt;

          while (next <= -ITEM_TOTAL) {
            setSliderItems(prevItems => {
              const newItems = [...prevItems];
              const first = newItems.shift();
              if (first) newItems.push(first);
              return newItems;
            });
            next += ITEM_TOTAL;
          }
          return next;
        });

        animationRef.current = requestAnimationFrame(step);
      };

      animationRef.current = requestAnimationFrame(step);

      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [state, sliderItems.length]);

  useEffect(() => {
    const winningItem = wonItems[0];

    if (state === 'spinning' && winningItem) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const winningIndex = Math.floor(ITEMS_TO_GENERATE * 0.7);
      
      setSliderItems(prev => {
        const newItems = [...prev];
        newItems[winningIndex] = winningItem;
        return newItems;
      });

      const spinAud = spinAudioRef.current;
      if (spinAud) {
        try {
          spinAud.currentTime = 0;
          const p = spinAud.play();
          if (p) p.catch(() => console.warn('Audio play failed'));
        } catch {}
      }

      const centerIndex = Math.floor(ITEMS_TO_GENERATE / 2);
      const extraLaps = 4;
      const mod = ITEMS_TO_GENERATE;

      const diff = ((winningIndex - centerIndex) % mod + mod) % mod;
      const K = extraLaps * mod + diff;

      setOffset(currentOffset => {
        const n = ((currentOffset % ITEM_TOTAL) + ITEM_TOTAL) % ITEM_TOTAL;
        startOffsetRef.current = n > 0 ? n - ITEM_TOTAL : n;
        return currentOffset;
      });
      
      targetOffsetRef.current = -K * ITEM_TOTAL;
      startTimeRef.current = performance.now();
      shiftedCountRef.current = 0;
      targetItemIndexRef.current = winningIndex;

      const finalize = () => {
        if (spinAud) {
          try {
            spinAud.pause();
            spinAud.currentTime = 0;
          } catch {}
        }

        const finalTotalShifted = Math.floor(-targetOffsetRef.current / ITEM_TOTAL);
        const remainShift = finalTotalShifted - shiftedCountRef.current;
        if (remainShift > 0) {
          setSliderItems(prev => {
            const arr = [...prev];
            for (let i = 0; i < remainShift; i++) {
              const first = arr.shift();
              if (first) arr.push(first);
            }
            return arr;
          });
          shiftedCountRef.current = finalTotalShifted;
        }

        setSliderItems(prev => {
          const arr = [...prev];
          arr[centerIndex] = winningItem;
          return arr;
        });

        setOffset(0);
        finishSpin();
      };

      const animate = (now: number) => {
        const elapsed = now - (startTimeRef.current as number);
        const t = Math.min(elapsed / SPIN_DURATION_MS, 1);

        const eased = 1 - Math.pow(1 - t, 4);

        const start = startOffsetRef.current;
        const target = targetOffsetRef.current;
        const rawOffset = start + (target - start) * eased;

        const totalShifted = Math.floor(-rawOffset / ITEM_TOTAL);
        const displayOffset = rawOffset + totalShifted * ITEM_TOTAL;

        const needShift = totalShifted - shiftedCountRef.current;
        if (needShift > 0) {
          setSliderItems(prev => {
            const arr = [...prev];
            for (let i = 0; i < needShift; i++) {
              const first = arr.shift();
              if (first) arr.push(first);
            }
            return arr;
          });
          shiftedCountRef.current = totalShifted;
        }

        setOffset(displayOffset);

        if (t >= 1) {
          finalize();
        } else {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }
  }, [state, wonItems]);

  useEffect(() => {
    if (state === 'finished') {
      const awardAudio = awardAudioRef.current;
      if (awardAudio) {
        awardAudio.currentTime = 0;
        const playPromise = awardAudio.play();
        if (playPromise) {
          playPromise.catch(() => console.warn('Award audio play failed'));
        }
      }
    }
  }, [state]);

  useEffect(() => {
    if (state === 'finished' && wonItems.length > 0) {
      if (wonItems.length === 1) {
        setShowcaseIndex(-1);
        setDisplayedItems([wonItems[0]]);
      } else {
        setShowcaseIndex(0);
        setDisplayedItems([]);
      }
    }
  }, [state, wonItems]);

  useEffect(() => {
    if (state !== 'finished' || wonItems.length <= 1) return;
    if (showcaseIndex < 0 || showcaseIndex >= wonItems.length) return;

    const tier = getCaseItemRarityTier(wonItems[showcaseIndex]);
    const timeout = tier != null && tier >= 6 ? 2000 : 1000;
    const idx = showcaseIndex;

    const timer = setTimeout(() => {
      setDisplayedItems(prev => [...prev, wonItems[idx]]);
      setShowcaseIndex(idx < wonItems.length - 1 ? idx + 1 : -1);
    }, timeout);

    return () => clearTimeout(timer);
  }, [state, showcaseIndex, wonItems]);

  const skipShowcaseAnimation = useCallback(() => {
    if (state !== 'finished' || showcaseIndex < 0 || showcaseIndex >= wonItems.length) return;
    const remaining = wonItems.slice(showcaseIndex);
    setDisplayedItems(prev => [...prev, ...remaining]);
    setShowcaseIndex(-1);
  }, [state, showcaseIndex, wonItems]);

  useEffect(() => {
    const onSpace = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        skipShowcaseAnimation();
      }
    };
    if (state === 'finished' && showcaseIndex >= 0 && wonItems.length > 1) {
      window.addEventListener('keydown', onSpace);
      return () => window.removeEventListener('keydown', onSpace);
    }
  }, [state, showcaseIndex, wonItems.length, skipShowcaseAnimation]);

  const handleOpenCase = async () => {
    if (state !== 'idle' || !canOpen) return;

    const requestData = {
      consumeType: 'item',
      caseName: caseCollection?.name,
      amount: selectedAmount
    };

    try {
      const response = await fetchNui<ApiResponseData<{ items: CaseItem[] }>>(
        'main:openCase',
        requestData,
        {
          success: true,
          message: 'Mở rương thành công',
          data: {
            items: selectedAmount === 1
              ? [mockCaseClothingItem(4, 20)]
              : selectedAmount === 5
              ? [
                  mockCaseClothingItem(2, 30),
                  mockCaseClothingItem(3, 20),
                  mockCaseClothingItem(5, 8),
                  mockCaseClothingItem(7, 2),
                  mockCaseClothingItem(2, 30),
                ]
              : [
                  mockCaseClothingItem(2, 30),
                  mockCaseClothingItem(3, 20),
                  mockCaseClothingItem(5, 8),
                  mockCaseClothingItem(7, 2),
                  mockCaseClothingItem(2, 30),
                  mockCaseClothingItem(4, 20),
                  mockCaseClothingItem(2, 30),
                  mockCaseClothingItem(6, 8),
                  mockCaseClothingItem(4, 20),
                  mockCaseClothingItem(2, 30),
                ]
          }
        }
      );

      if (response?.success) {
        const winningItems = response.data?.items;

        if (!winningItems || winningItems.length === 0) return;

        setWonItems(winningItems);

        mainService.startSpin({
          type: 'other',
          winningItem: winningItems[0]
        });
      } else {
        console.error(response?.message || 'Không thể mở rương');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  const clearRewardState = useCallback(() => {
    setWonItems([]);
    setShowcaseIndex(-1);
    setDisplayedItems([]);
    resetState();
  }, [resetState]);

  const handleClaimAllRewards = useCallback(async () => {
    if (wonItems.length === 0) {
      clearRewardState();
      return;
    }

    const awardAudio = awardAudioRef.current;
    if (awardAudio) {
      try {
        awardAudio.pause();
        awardAudio.currentTime = 0;
      } catch {}
    }

    try {
      await fetchNui<ApiResponseData<void>>(
        'main:claimReward',
        {
          consumeType: 'item',
          caseName: caseCollection?.name,
          amount: wonItems.length,
          items: wonItems
        },
        {
          success: true,
          message: 'Đã nhận thưởng thành công'
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      return;
    }

    clearRewardState();
  }, [wonItems, caseCollection?.name, clearRewardState]);

  const handleClose = async () => {
    if (state !== 'idle') return;
    // resetSelectedCase();
    await fetchNui("main:close");
  };

  const getCenterItem = (): CaseItem | null => {
    if (sliderItems.length === 0) return null;

   const centerIndex = Math.floor(ITEMS_TO_GENERATE / 2);

   const indexOffset = -Math.round(offset / ITEM_TOTAL);
   let actualCenter = centerIndex + indexOffset;

   while (actualCenter < 0) actualCenter += sliderItems.length;
   actualCenter = actualCenter % sliderItems.length;

   return sliderItems[actualCenter] || null;
  };

  const getItemOpacity = (index: number): number => {
    const centerIndex = Math.floor(sliderItems.length / 2);
    const posVh = (index - centerIndex) * ITEM_TOTAL + offset;

    if (state === 'finished') {
      const indexOffset = -Math.round(offset / ITEM_TOTAL);
      let centeredIdx = centerIndex + indexOffset;
      while (centeredIdx < 0) centeredIdx += sliderItems.length;
      centeredIdx = centeredIdx % sliderItems.length;
      if (index === centeredIdx) return 0;
    }

    const maxDistanceVh = 69.425;
    if (Math.abs(posVh) > maxDistanceVh) return 0;

    const t = Math.min(Math.abs(posVh) / maxDistanceVh, 1);
    const smooth = t * t * (3 - 2 * t);
    const opacity = 0.15 + (1 - smooth) * (1 - 0.15);
    return opacity;
  };

  const centerItem = getCenterItem();

  const isButtonEnabled = (amount: SelectedAmount): boolean => {
    const buttonConfig = caseCollection?.buttons;
    if (!buttonConfig) return false;
    return buttonConfig.includes(amount);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: .25,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          className="absolute inset-0"
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 z-[50] pointer-events-none bg-[#000] flex items-center justify-center"
            initial={{
              clipPath: 'inset(0 0 0 0)',
              opacity: 1,
            }}
            animate={{
              clipPath: 'inset(0 0 100% 0)',
              opacity: 0,
            }}
            transition={{
              duration: 1.32,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              backgroundColor: '#000',
              backgroundImage:
                'repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(255,255,255,0) 3px, rgba(255,255,255,0) 6px)',
              backgroundSize: '100% 24px',
              willChange: 'clip-path, filter, opacity',
            }}
          >
            <img
              src="/images/logo.webp"
              alt="GTAGO Logo"
              className="pointer-events-none size-[32vh] object-contain"
              loading="lazy"
            />
          </motion.div>

          <div className="relative size-full flex flex-col items-center justify-center pt-[3vh]">
            <div
              className="pointer-events-none absolute inset-0 z-[1] size-full bg-[url('/images/case-opening-bg.webp')] bg-no-repeat bg-full-size bg-full-center opacity-[0.88]"
              style={{
                backgroundImage: 'url("/images/case-opening-bg.webp"), radial-gradient(180.94% 70.6% at 50% 100%, #1F0001 0%, rgba(18, 2, 2, 0.90) 100%)',
                backgroundSize: 'cover, cover',
                backgroundPosition: 'center, center',
                backgroundRepeat: 'no-repeat, no-repeat',
                backgroundBlendMode: 'multiply, normal'
              }}
              aria-hidden="true"
            />
            <div 
              className="pointer-events-none absolute inset-0 z-[1] size-full opacity-[0.65]"
              style={{
                background: 'radial-gradient(180.94% 70.6% at 50% 100%, #1F0001 0%, rgba(18, 2, 2, 0.90) 100%)',
                backgroundBlendMode: 'normal, multiply, normal',
              }}
            />
            <div className="pointer-events-none absolute bottom-0 left-0 z-[1] w-full h-[9.7vh] bg-[url('/images/donation-asset.webp')] bg-no-repeat bg-full-size bg-full-center" />
            <h1 className="case__header--title text-[3.8vh] font-bold uppercase mb-[1.85vh] !font-roboto z-[2]">
              {caseCollection?.label || 'Chưa cập nhật'}
            </h1>
            <p className="!font-roboto case__header--description text-[1.55vh] font-normal text-[#FFB4B5] mb-[8.4vh] z-[2]">
              {caseCollection?.description || 'Nhận skin súng, phụ kiện súng và các nhu yếu phẩm'}
            </p>

            <div className="flex items-center justify-center pb-[12.9vh] w-[53.4vh] h-[35.2vh] relative -mb-[6vh] z-[2]">
              <div className="flex items-center justify-center absolute -top-[6.2vh] right-[3.75vw] min-w-[8.05vh] h-[2.95vh] bg-[url('/images/case-remaining-wrapper.webp')] bg-no-repeat bg-full-size bg-full-center pt-[.05vh] pl-[1.5vh] pr-[.5vh] drop-shadow-[0_4px_4px_#00000040] z-[2]">
                <span className="text-[1.55vh] font-medium text-white">
                  {`x${formatNumber(ownedCaseCount)}`}
                </span>
              </div>
              <Image
                src={getInventoryImageUrl(caseCollection?.name || 'vehicle_case_1')}
                alt="case"
                className="size-[42.7vh] drop-shadow-[0_4px_6.3px_rgba(0,255,153,0.17)]"
                enableLoadingBg={false}
                skeletonTextSize="text-[1.65vh]"
                fallbackSrc="/images/box.webp"
              />
            </div>

            <p className="!font-roboto text-[1.55vh] font-normal text-[#FFC2C3] mb-[2vh] z-[2]">
              Vật phẩm có trong rương:
            </p>

            <CaseSlider
              ref={viewportRef}
              sliderItems={sliderItems}
              offset={offset}
              centerItem={centerItem}
              getItemOpacity={getItemOpacity}
              itemRefs={itemRefs}
            />

            <ActionButtons
              state={state}
              selectedAmount={selectedAmount}
              canOpen={canOpen}
              isButtonEnabled={isButtonEnabled}
              canOpenWithAmount={canOpenWithAmount}
              onSelectAmount={setSelectedAmount}
              onOpenCase={handleOpenCase}
              onClose={handleClose}
            />

            <ResultOverlay
              isVisible={state === 'finished' && wonItems.length > 0}
              wonItems={wonItems}
              showcaseIndex={showcaseIndex}
              displayedItems={displayedItems}
              getItemDisplayLabel={getItemDisplayLabel}
              onClaimAllRewards={handleClaimAllRewards}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default CaseOpening;