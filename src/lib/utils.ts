function setDarkMode() {
  let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const settings = localStorage.getItem("darkTheme");
  if (settings && settings !== "0") isDarkMode = settings === "1";

  window.document.body.classList.toggle("dark-mode", isDarkMode);
}

function wheelToScrollHorizontally(parentTagName: string) {
  return function (event: WheelEvent) {
    event.preventDefault();

    let [x, y] = [event.deltaX, event.deltaY];
    let magnitude;

    if (x === 0) magnitude = y < 0 ? -30 : 30;
    else magnitude = x;

    if (event.target) {
      let elem = event.target as Element;
      if (elem.tagName !== parentTagName && elem.parentElement)
        elem = elem.parentElement;

      elem.scrollBy({
        left: magnitude,
      });
    }
  };
}

function convertRemToPixels(rem: number) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function sleep(duration: number): Promise<void> {
  return new Promise((res) => setTimeout(res, duration));
}

function throttle(mainFunction: () => void, delay: number) {
  let timerFlag: NodeJS.Timeout | null = null;

  return () => {
    if (timerFlag !== null) clearTimeout(timerFlag);
    timerFlag = setTimeout(() => mainFunction(), delay);
  };
}

export {
  convertRemToPixels,
  setDarkMode,
  sleep,
  throttle,
  wheelToScrollHorizontally,
};
