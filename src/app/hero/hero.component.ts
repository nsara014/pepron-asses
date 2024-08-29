import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent implements OnInit {
  timeLeft: string = '';

  ngOnInit(): void {
    this.updateCountdown();
  }

  updateCountdown(): void {
    const endDate = new Date('October 31, 2024 17:00:00 PDT');
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();

    if (timeDiff > 0) {
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      this.timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
      this.timeLeft = '0d 0h 0m 0s';
    }
  }
}
