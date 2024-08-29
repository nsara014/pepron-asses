import { Component, OnInit, HostListener } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as cheerio from 'cheerio';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  author: string;
  company: string;
  likes: number;
  comments: number;
  readMoreLink: string;
}

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
  linkedin: string;
}

interface PressArticle {
  title: string;
  source: string;
  date: string;
  image: string;
  description: string;
  link: string;
}

interface Risk {
  title: string;
  content: string;
}

@Component({
  selector: 'app-investment-summary',
  standalone: true,
  templateUrl: './investment-summary.component.html',
  styleUrls: ['./investment-summary.component.css'],
  imports: [NgIf, NgFor, FormsModule, CommonModule, HttpClientModule],
})
export class InvestmentSummaryComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  articles: PressArticle[] = [];
  activeSection: string = 'pitch';
  showSidebar: boolean = false;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const yOffset = window.scrollY;
    this.showSidebar = yOffset > 850 && yOffset < 8500; // Shows sidebar if scrolled more than 100px
  }
  visibleSections: { [key: string]: boolean } = {
    disclaimer: false,
    leadership: false,
  };

  investmentAmount: number | null = null;
  isValidAmount = false;

  // Risks-related properties
  risks: Risk[] = [];
  displayedRisks: Risk[] = [];
  selectedRisk: Risk | null = null;
  showAllRisks = false;
  riskDetailsTop = 0;
  timeLine: any[] = [];
  isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Only execute browser-specific code here
      console.log('Running in the browser');
      // You can safely use browser-specific objects like `window`, `document`, etc., here
    } else {
      console.log('Running on the server');
    }
  }

  ngOnInit(): void {
    this.loadTeamMembers();
    this.loadPressArticles();
    this.loadRisks();
    this.loadTimeLine();
  }
  loadTimeLine(): void {
    this.http.get<any[]>('assets/timeline.json').subscribe((data) => {
      this.timeLine = data;
    });
  }
  loadTeamMembers(): void {
    this.http.get<TeamMember[]>('assets/team.json').subscribe(
      (data) => {
        this.teamMembers = data;
      },
      (error) => {
        console.error('Error loading team data:', error);
      }
    );
  }

  loadPressArticles(): void {
    this.http.get<{ link: string }[]>('assets/press.json').subscribe(
      (data) => {
        data.forEach((item) => {
          this.fetchArticleData(item.link);
        });
      },
      (error) => {
        console.error('Error loading press links:', error);
      }
    );
  }

  fetchArticleData(url: string): void {
    this.http.get(url, { responseType: 'text' }).subscribe(
      (html) => {
        const $ = cheerio.load(html); // Load HTML into Cheerio

        const title =
          $('meta[property="og:title"]').attr('content') || $('title').text();
        const description =
          $('meta[property="og:description"]').attr('content') ||
          $('meta[name="description"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');
        const date = $('meta[property="article:published_time"]').attr(
          'content'
        );
        const source = new URL(url).hostname;

        this.articles.push({
          title: title || 'Untitled',
          description: description || 'No description available',
          image: image || 'assets/avawatz.webp', // Provide a default image in case of missing data
          date: date || 'Unknown date',
          source: source || 'Unknown source',
          link: url,
        });
      },
      (error) => {
        console.error('Error fetching article data:', error);
      }
    );
  }

  loadRisks(): void {
    this.http.get<Risk[]>('assets/risks.json').subscribe(
      (data) => {
        this.risks = data;
        this.displayedRisks = this.risks.slice(0, 5); // Initially show only the first 3 risks
        this.selectedRisk = this.displayedRisks[0]; // Default to the first risk
      },
      (error) => {
        console.error('Error loading risks:', error);
      }
    );
  }

  // Risks-related methods
  selectRisk(risk: Risk, event: Event): void {
    event.preventDefault();
    this.selectedRisk = risk;
  }

  toggleShowAll(event: Event): void {
    event.preventDefault();
    this.showAllRisks = !this.showAllRisks;
    this.displayedRisks = this.showAllRisks
      ? this.risks
      : this.risks.slice(0, 5);
  }

  showSection(section: string): void {
    this.activeSection = section;
  }

  toggleSectionVisibility(section: string, event: Event): void {
    event.preventDefault();
    this.visibleSections[section] = !this.visibleSections[section];
  }

  validateInput(event: Event): void {
    const input = (event.target as HTMLInputElement).valueAsNumber;
    this.isValidAmount = input >= 2500;
  }

  invest(): void {
    if (this.isValidAmount) {
      alert('Investment process initiated for AvaWatz!');
    }
  }
}
