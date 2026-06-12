import { Pipe, PipeTransform } from '@angular/core';

/**
 * ReplacePipe — string replacement for templates.
 * Usage: {{ value | replace:'search':'replacement' }}
 * Example: {{ r.ts | slice:0:19 | replace:'T':' ' }}
 */
@Pipe({
  name: 'replace',
  standalone: true,
})
export class ReplacePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any, search: string | RegExp, replacement: string = ''): string {
    if (value == null) return '';
    return String(value).split(search as string).join(replacement);
  }
}
