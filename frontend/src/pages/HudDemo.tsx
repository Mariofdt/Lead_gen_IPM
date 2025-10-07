import CircularGauge from '../hud/CircularGauge';
import ProgressBarHUD from '../hud/ProgressBarHUD';
import DataPanel from '../hud/DataPanel';
import '../hud/hud.css';

export default function HudDemo() {
  return (
    <div className="hud-root p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <CircularGauge value={87} label="Mission Progress" />
          <ProgressBarHUD label="Activated" value={89} />
          <ProgressBarHUD label="Systems" value={72} />
        </div>
        <div className="space-y-4">
          <DataPanel title="Telemetry">
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div>
                <div className="hud-label">813</div>
                <div className="text-xs">Units</div>
              </div>
              <div>
                <div className="hud-label">10.7</div>
                <div className="text-xs">Velocity</div>
              </div>
              <div>
                <div className="hud-label">75.3</div>
                <div className="text-xs">Signal</div>
              </div>
            </div>
          </DataPanel>
          <DataPanel title="Status">
            <div className="text-xs">All systems nominal. Awaiting command...</div>
          </DataPanel>
        </div>
        <div className="space-y-4">
          <DataPanel title="World Map">
            <div className="h-48 flex items-center justify-center text-xs">(placeholder mappa)</div>
          </DataPanel>
          <DataPanel title="Controls">
            <div className="flex items-center gap-2">
              <button className="hud-panel px-3 py-2">▶</button>
              <button className="hud-panel px-3 py-2">⏸</button>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}

