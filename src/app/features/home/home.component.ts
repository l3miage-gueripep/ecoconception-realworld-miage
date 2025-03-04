import { NgClass, NgForOf } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import { ArticleListConfig } from "../../core/models/article-list-config.model";
import { TagsService } from "../../core/services/tags.service";
import { UserService } from "../../core/services/user.service";
import { ArticleListComponent } from "../../shared/article-helpers/article-list.component";
import { ShowAuthedDirective } from "../../shared/show-authed.directive";

@Component({
  selector: "app-home-page",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  imports: [NgClass, ArticleListComponent, NgForOf, ShowAuthedDirective],
  standalone: true,
})
export class HomeComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  listConfig: ArticleListConfig = {
    type: "all",
    filters: {},
  };
  tags$ = inject(TagsService)
    .getAll()
    .pipe(tap(() => (this.tagsLoaded = true)));
  tagsLoaded = false;
  destroy$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.isAuthenticated
      .pipe(
        tap((isAuthenticated) => {
          if (isAuthenticated) {
            this.setListTo("feed");
          } else {
            this.setListTo("all");
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (isAuthenticated: boolean) => (this.isAuthenticated = isAuthenticated)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setListTo(type: string = "", filters: Object = {}): void {
    // If feed is requested but user is not authenticated, redirect to login
    if (type === "feed" && !this.isAuthenticated) {
      void this.router.navigate(["/login"]);
      return;
    }

    // Otherwise, set the list object
    this.listConfig = { type: type, filters: filters };
  }
}
