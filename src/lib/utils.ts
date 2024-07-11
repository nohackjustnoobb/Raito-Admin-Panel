// TODO User Overrides
function setDarkMode(dark: boolean | undefined) {
  window.document.body.classList.toggle("dark-mode", dark);
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

export { convertRemToPixels, setDarkMode, sleep, wheelToScrollHorizontally };
