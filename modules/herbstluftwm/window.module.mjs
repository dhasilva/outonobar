// Node
import { on } from 'events';

// Base
import BaseModule from '../base.module.mjs' // AQUI

// Service
import HerbstluftService from '../../services/herbstluft.service.mjs';

export default class HerbstluftWindowModule extends BaseModule {
  constructor(options = {}) {
    super({
      monitor: '0',
      maxLength: 120,

      ...options
    });

    this.service = HerbstluftService.getService();
  }

  async initialize() {
    try {
      // ref: https://herbstluftwm.org/herbstluftwm.html
      const tagName = await $s`herbstclient get_attr monitors.${this.monitor}.tag`;
      this.data = this.transform(await $s`herbstclient get_attr tags.by-name.${tagName}.focused_client.title`);
    }
    catch {
      // Empty frame
      this.data = '';
    }

    this.listen();
  }

  async listen() {
    for await (const [title] of on(this.service.emitter, 'window')) {
      const focusedMonitor = await $s`herbstclient get_attr monitors.focus.index`;

      if (focusedMonitor === this.monitor) this.data = this.transform(title);
    }
  }

  transform(data) {
    if (data.length <= this.maxLength) return data;
    // Crops long window title
    return `${data.slice(0, this.maxLength - 3)}...`;
  }
}
