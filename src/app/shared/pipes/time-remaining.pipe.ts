import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeRemaining',
})
export class TimeRemainingPipe implements PipeTransform {
    transform(value: number) {
        // if (value <= 60) {
        //     return `${value} seconds`;
        // }

        // const minutesRemaining = Math.ceil(value / 60);
        // return `${minutesRemaining} minutes`;

        const hours   = Math.floor(value / 3600);
        const minutes = Math.floor((value - (hours * 3600)) / 60);
        const seconds =  Math.round( (value - (hours * 3600) - (minutes * 60)) * 100 ) / 100;
        // seconds = Math.round(seconds * 100) / 100;
        return `${hours}:${minutes}:${seconds}`;
    }
}
