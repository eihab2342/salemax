import { Icon } from './icon';

/** Abstract product illustrations, without invented customer data or results. */
export function DigitalScene({ kind = 0 }: { kind?: number }) {
  return <div className={`digital-scene digital-scene-${kind % 3}`} aria-hidden="true">
    <div className="scene-disc" /><div className="scene-ring" />
    <div className="scene-browser"><div className="scene-browser-bar"><i /><i /><i /><span /></div><div className="scene-browser-body"><div className="scene-browser-nav"><i /><i /><i /><i /></div><div className="scene-browser-content"><span /><strong /><strong /><div className="scene-tiles"><i /><i /><i /></div><div className="scene-lines"><i /><i /><i /></div></div></div></div>
    <div className="scene-phone"><div className="scene-phone-notch" /><Icon name={['smartphone', 'shoppingcart', 'code'][kind % 3]} size={30} /><span /><strong /><div><i /><i /><i /><i /></div><b /></div>
    <div className="scene-chip chip-one"><Icon name={['code', 'globe', 'workflow'][kind % 3]} size={23} /></div><div className="scene-chip chip-two"><Icon name="check" size={23} /></div>
  </div>;
}
