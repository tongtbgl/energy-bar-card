class EnergyBarCard extends HTMLElement {
setConfig(config) {
this._config = config;
this.attachShadow({ mode: 'open' });
this.render();
}

set hass(hass) {
this._hass = hass;
this.render();
}

render() {
if (!this._hass || !this._config) return;
const c = this._config;
const h = c.bar_height || 24;
const fontSize = c.total_font_size || 32;
const fontWeight = c.font_weight_total || 'bold';
const entities = c.entities || [];
const showTotal = c.show_total !== false;
const showDecimal = c.decimal_precision !== false;

let total = 0;
const rawValues = entities.map(e => {
const state = this._hass.states[e.entity_id];
const val = parseFloat(state?.state) || 0;
total += val;
return {
name: e.name || state?.attributes.friendly_name || e.entity_id,
value: val,
unit: state?.attributes.unit_of_measurement || '',
color: e.color || '#999'
};
});

const values = rawValues.map(v => {
const percent = total > 0 ? (v.value / total) * 100 : 0;
return { ...v, percent };
});

const bars = values.map(v => `
<div class="segment" style="width: ${Math.round(v.percent)}%; background: ${v.color};">
<div class="text">${v.percent >= 10 ? `${Math.round(v.percent)}%` : ''}</div>
</div>`).join('');

const legends = values.map(v => `
<div class="legend-row">
<div class="legend-left">
<div class="dot" style="background:${v.color}"></div>
<span class="label-text">${v.name}</span>
</div>
<span class="value-right">${showDecimal ? v.value.toFixed(1) : Math.round(v.value)} ${v.unit}</span>
</div>`).join('');

const unit = values[0]?.unit || '';
const html = `
<style>
:host {
--text-color: var(--primary-text-color, #000);
}
.container {
padding: 16px;
font-family: sans-serif;
}
.top-info {
display: flex;
flex-wrap: wrap;
justify-content: ${showTotal ? 'space-between' : 'center'};
margin-bottom: 12px;
}
.total-block {
${showTotal ? 'flex: 0 0 40%; display: flex; flex-direction: column;' : 'display:none;'}
}
.total-value {
font-size: ${fontSize}px;
font-weight: ${fontWeight};
line-height: 1.2;
color: var(--text-color);
}
.total-unit {
font-size: 13px;
color: var(--text-color);
margin-top: 2px;
}
.legends {
${showTotal ? 'flex: 0 0 60%' : 'text-align: center; width: 100%'};
display: flex;
flex-direction: column;
gap: 6px;
font-size: 13px;
}
.legend-row {
display: flex;
justify-content: space-between;
align-items: center;
gap: 20px;
}
.legend-left {
display: flex;
align-items: center;
gap: 6px;
min-width: 0;
flex: 1;
}
.label-text {
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
color: var(--text-color);
}
.dot {
width: 10px;
height: 10px;
border-radius: 50%;
flex-shrink: 0;
}
.value-right {
font-weight: 500;
white-space: nowrap;
color: var(--text-color);
}
.bar-container {
width: 100%;
height: ${h}px;
display: flex;
border-radius: 8px;
overflow: hidden;
background: #e0e0e0;
font-weight: bold;
font-size: 12px;
line-height: ${h}px;
margin-top: 10px;
}
.segment {
height: 100%;
display: flex;
justify-content: center;
align-items: center;
white-space: nowrap;
overflow: hidden;
}
.text {
padding: 0 4px;
width: 100%;
text-overflow: ellipsis;
overflow: hidden;
text-align: center;
color: #fff;
}
</style>
<div class="container">
<div class="top-info">
<div class="total-block">
<div class="total-value">${showDecimal ? total.toFixed(1) : Math.round(total)}</div>
<div class="total-unit">${unit}</div>
</div>
<div class="legends">${legends}</div>
</div>
<div class="bar-container">${bars}</div>
</div>
`;

this.shadowRoot.innerHTML = html;
}

getCardSize() {
return 2;
}
}

customElements.define('energy-bar-card', EnergyBarCard);
