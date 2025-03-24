import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactElement;
  text: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  text, 
  position = 'right',
  delay = 100
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = () => {
    if (!triggerRef.current) return { x: 0, y: 0 };
    
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    switch (position) {
      case 'left':
        return {
          x: rect.left + scrollX - 10,
          y: rect.top + scrollY + rect.height / 2
        };
      case 'right':
        return {
          x: rect.left + scrollX + rect.width + 10,
          y: rect.top + scrollY + rect.height / 2
        };
      case 'top':
        return {
          x: rect.left + scrollX + rect.width / 2,
          y: rect.top + scrollY - 10
        };
      case 'bottom':
        return {
          x: rect.left + scrollX + rect.width / 2,
          y: rect.top + scrollY + rect.height + 10
        };
      default:
        return { x: 0, y: 0 };
    }
  };

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setCoords(calculatePosition());
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </span>

      {isVisible &&
        createPortal(
          <div className={`tooltip ${position}`} style={{
            left: coords.x,
            top: coords.y
          }}>
            {text}
            <div className="tooltip-arrow" />
            
            <style>{`
              .tooltip {
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                pointer-events: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                animation: tooltip-fadeIn 0.2s ease-out;
                z-index: 1000;
                white-space: nowrap;
                transform: translate(var(--translate-x), var(--translate-y));
              }

              .tooltip.left {
                --translate-x: -100%;
                --translate-y: -50%;
              }

              .tooltip.right {
                --translate-x: 0%;
                --translate-y: -50%;
              }

              .tooltip.top {
                --translate-x: -50%;
                --translate-y: -100%;
              }

              .tooltip.bottom {
                --translate-x: -50%;
                --translate-y: 0%;
              }

              .tooltip-arrow {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #333;
                transform: rotate(45deg);
              }

              .tooltip.left .tooltip-arrow {
                right: -4px;
                top: 50%;
                transform: translateY(-50%) rotate(45deg);
              }

              .tooltip.right .tooltip-arrow {
                left: -4px;
                top: 50%;
                transform: translateY(-50%) rotate(45deg);
              }

              .tooltip.top .tooltip-arrow {
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%) rotate(45deg);
              }

              .tooltip.bottom .tooltip-arrow {
                top: -4px;
                left: 50%;
                transform: translateX(-50%) rotate(45deg);
              }

              @keyframes tooltip-fadeIn {
                from {
                  opacity: 0;
                  transform: translate(
                    var(--translate-x),
                    calc(var(--translate-y) + 10px)
                  );
                }
                to {
                  opacity: 1;
                  transform: translate(
                    var(--translate-x),
                    var(--translate-y)
                  );
                }
              }

              .tooltip-trigger {
                display: inline-block;
                cursor: pointer;
                position: relative;
              }
            `}</style>
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;