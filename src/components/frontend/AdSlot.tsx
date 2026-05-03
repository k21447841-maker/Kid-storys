import { useEffect, useRef } from 'react';

export default function AdSlot({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !html) return;
    
    ref.current.innerHTML = '';
    
    const slot = document.createElement('div');
    slot.innerHTML = html;
    
    const scripts = Array.from(slot.querySelectorAll('script'));
    const nonScripts = Array.from(slot.childNodes).filter(node => node.nodeName !== 'SCRIPT');
    
    nonScripts.forEach(node => {
      if (ref.current) {
        ref.current.appendChild(node.cloneNode(true));
      }
    });
    
    scripts.forEach(script => {
      if (ref.current) {
        const newScript = document.createElement('script');
        Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(script.innerHTML));
        ref.current.appendChild(newScript);
      }
    });
  }, [html]);

  if (!html) return null;

  return <div ref={ref} className="ad-container w-full overflow-hidden flex justify-center my-4 empty:hidden" />;
}
