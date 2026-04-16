import { CaseOpeningState, SelectedAmount } from '@/types';
import { getGradientBorderStyle, getSharedButtonBackgroundStyleNoDots } from '@/utils/helpers';
import { useSound } from '@/providers';

interface ActionButtonsProps {
  state: CaseOpeningState;
  selectedAmount: SelectedAmount;
  canOpen: boolean;
  isButtonEnabled: (amount: SelectedAmount) => boolean;
  canOpenWithAmount: (amount: SelectedAmount) => boolean;
  onSelectAmount: (amount: SelectedAmount) => void;
  onOpenCase: () => void;
  onClose: () => void;
}

const GREEN_BUTTON_BASE =
  'radial-gradient(82.89% 77.08% at 49.48% 100%, rgba(99, 150, 67, 0.38) 0%, rgba(13, 34, 28, 0.11) 100%), linear-gradient(180deg, rgba(18, 23, 27, 0.00) 0%, rgba(36, 47, 43, 0.70) 100%), linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50))';

const OpenCaseButton = ({
  state,
  canOpen,
  onOpenCase
}: Pick<ActionButtonsProps, 'state' | 'canOpen' | 'onOpenCase'>): JSX.Element => {
  return (
    <button
      onClick={() => {
        void onOpenCase();
      }}
      disabled={state !== 'idle' || !canOpen}
      className="min-w-[14vh] px-[1.75vh] h-full overflow-hidden rounded-[.45vh] outline-none border-[.1vh] cursor-pointer hover:opacity-75 transition-all duration-250 disabled:opacity-50 disabled:pointer-events-none"
      style={{
        ...getGradientBorderStyle('#CDEEFF4D', '#5D71844D'),
        backgroundImage:
          'radial-gradient(82.89% 77.08% at 49.48% 100%, rgba(0, 72, 255, 0.38) 0%, rgba(0, 23, 72, 0.11) 100%), linear-gradient(180deg, rgba(18, 23, 27, 0.00) 0%, rgba(36, 47, 43, 0.70) 100%), linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), linear-gradient(180deg, #CDEEFF4D 0%, #5D71844D 100%)',
        ...getSharedButtonBackgroundStyleNoDots(),
      }}
    >
      <span className="text-[1.85vh] font-medium text-white">
        {state === 'spinning' ? 'Đang quay...' : canOpen ? 'Mở rương' : 'Không đủ rương'}
      </span>
    </button>
  );
};

const CloseButton = ({
  state,
  onClose
}: Pick<ActionButtonsProps, 'state' | 'onClose'>): JSX.Element => {
  const { playSound } = useSound();
  return (
    <button
      onClick={() => {
        playSound('BTN_CLICK');
        void onClose();
      }}
      disabled={state !== 'idle'}
      className="w-[14vh] h-full overflow-hidden rounded-[.45vh] outline-none border-[.1vh] cursor-pointer hover:opacity-75 transition-all duration-250 disabled:opacity-50 disabled:pointer-events-none"
      style={{
        ...getGradientBorderStyle('#FFCDCD4D', '#845D5D4D'),
        backgroundImage:
          'radial-gradient(82.89% 77.08% at 49.48% 100%, rgba(255, 9, 0, 0.56) 0%, rgba(72, 0, 18, 0.11) 100%), linear-gradient(180deg, rgba(18, 23, 27, 0.00) 0%, rgba(36, 47, 43, 0.70) 100%), linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), linear-gradient(180deg, #FFCDCD4D 0%, #845D5D4D 100%)',
        ...getSharedButtonBackgroundStyleNoDots(),
      }}
    >
      <span className="text-[1.85vh] font-medium text-white">Hủy bỏ</span>
    </button>
  );
};

const AmountButton = ({
  amount,
  selectedAmount,
  state,
  canOpenWithAmount,
  onSelectAmount
}: {
  amount: SelectedAmount;
  selectedAmount: SelectedAmount;
  state: CaseOpeningState;
  canOpenWithAmount: (amount: SelectedAmount) => boolean;
  onSelectAmount: (amount: SelectedAmount) => void;
}): JSX.Element => {
  const { playSound } = useSound();
  const isSelected = selectedAmount === amount && canOpenWithAmount(amount);
  const borderBackground = isSelected
    ? 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))'
    : 'linear-gradient(180deg, #CDFFCD4D 0%, #5D845E4D 100%)';

  return (
    <button
      onClick={() => {
        playSound('BTN_CLICK');
        void onSelectAmount(amount);
      }}
      disabled={state !== 'idle' || !canOpenWithAmount(amount)}
      className="w-[4.65vh] h-full overflow-hidden rounded-[.45vh] outline-none border-[.1vh] cursor-pointer uppercase hover:opacity-75 transition-all duration-250 disabled:opacity-50 disabled:pointer-events-none"
      style={{
        ...getGradientBorderStyle('#CDFFCD4D', '#5D845E4D', isSelected),
        backgroundImage: `${GREEN_BUTTON_BASE}, ${borderBackground}`,
        ...getSharedButtonBackgroundStyleNoDots(),
      }}
    >
      <span className="text-[1.85vh] font-medium text-white">{`x${amount}`}</span>
    </button>
  );
};

const ActionButtons = ({
  state,
  selectedAmount,
  canOpen,
  isButtonEnabled,
  canOpenWithAmount,
  onSelectAmount,
  onOpenCase,
  onClose
}: ActionButtonsProps): JSX.Element => {
  return (
    <div className="flex items-center gap-[1.2vh] h-[4.9vh] z-[2]">
      {isButtonEnabled(10) && (
        <AmountButton
          amount={10}
          selectedAmount={selectedAmount}
          state={state}
          canOpenWithAmount={canOpenWithAmount}
          onSelectAmount={onSelectAmount}
        />
      )}
      {isButtonEnabled(5) && (
        <AmountButton
          amount={5}
          selectedAmount={selectedAmount}
          state={state}
          canOpenWithAmount={canOpenWithAmount}
          onSelectAmount={onSelectAmount}
        />
      )}
      {isButtonEnabled(1) && (
        <AmountButton
          amount={1}
          selectedAmount={selectedAmount}
          state={state}
          canOpenWithAmount={canOpenWithAmount}
          onSelectAmount={onSelectAmount}
        />
      )}
      <OpenCaseButton state={state} canOpen={canOpen} onOpenCase={onOpenCase} />
      <CloseButton state={state} onClose={onClose} />
    </div>
  );
};

export default ActionButtons;