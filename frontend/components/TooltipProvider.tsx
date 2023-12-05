import { mergeRefs } from "react-merge-refs";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  Placement,
} from "@floating-ui/react";
import {
  cloneElement,
  FC,
  MutableRefObject,
  ReactElement,
  useMemo,
  useState,
} from "react";
import classNames from "classnames";

// Adapted from https://floating-ui.com/docs/tooltip

type TooltipOptions = {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  portalRoot?: "main";
  boundary?: "main";
  absoluteCenter?: boolean;
};

function useTooltip(options: TooltipOptions = {}) {
  const {
    initialOpen = false,
    placement = "top",
    open: controlledOpen,
    onOpenChange: setControlledOpen,
  } = options;

  const boundary =
    options.boundary === "main"
      ? document.getElementsByTagName("main")[0]
      : undefined;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(5), flip({ boundary }), shift({ boundary })],
  });

  const context = data.context;

  const interactions = useInteractions([
    useHover(context, { move: false, enabled: controlledOpen == null }),
    useFocus(context, { enabled: controlledOpen == null }),
    useDismiss(context),
    useRole(context, { role: "tooltip" }),
  ]);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data],
  );
}

type Props = {
  children: ReactElement;
  content: ReactElement;
} & TooltipOptions;

const TooltipProvider: FC<Props> = ({
  children,
  content,
  absoluteCenter,
  ...options
}) => {
  const state = useTooltip(options);

  const childrenRef = (
    children as unknown as { ref: MutableRefObject<unknown> }
  ).ref;
  const ref = useMemo(
    () => mergeRefs([state.reference, childrenRef]),
    [state.reference, childrenRef],
  );

  return (
    <>
      {cloneElement(
        children,
        state.getReferenceProps({
          ref,
          ...children.props,
          "data-state": state.open ? "open" : "closed",
          onBlur(event) {
            children.props.onBlur?.(event);
            state.setOpen(false);
          },
        }),
      )}
      <FloatingPortal>
        {state.open && (
          <div
            ref={state.floating}
            style={{
              position: state.strategy,
              top: state.y ?? 0,
              left: absoluteCenter ? undefined : state.x ?? 0,
              visibility: state.x == null ? "hidden" : "visible",
            }}
            {...state.getFloatingProps({
              className: classNames("z-50", {
                "left-1/2 -translate-x-1/2": absoluteCenter,
              }),
            })}
          >
            {content}
          </div>
        )}
      </FloatingPortal>
    </>
  );
};

export default TooltipProvider;
export type { Props as TooltipProps };
