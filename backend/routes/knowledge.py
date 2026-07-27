from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db import get_db
from schemas import KnowledgeArticleDetail, KnowledgeArticleListItem
import models

router = APIRouter()


@router.get("/", response_model=list[KnowledgeArticleListItem])
def list_articles(
    category: str | None = Query(default=None, description="Filter by category slug"),
    db: Session = Depends(get_db),
):
    query = db.query(models.KnowledgeArticle).filter(models.KnowledgeArticle.is_published.is_(True))

    if category:
        query = query.filter(models.KnowledgeArticle.category == category)

    articles = query.order_by(models.KnowledgeArticle.title).all()

    return [
        KnowledgeArticleListItem(
            id=a.id,
            title=a.title,
            slug=a.slug,
            category=a.category,
            summary=a.summary,
            trek_id=a.trek_id,
        )
        for a in articles
    ]


@router.get("/{slug}", response_model=KnowledgeArticleDetail)
def get_article(slug: str, db: Session = Depends(get_db)):
    article = (
        db.query(models.KnowledgeArticle)
        .filter(
            models.KnowledgeArticle.slug == slug,
            models.KnowledgeArticle.is_published.is_(True),
        )
        .first()
    )

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return KnowledgeArticleDetail(
        id=article.id,
        title=article.title,
        slug=article.slug,
        category=article.category,
        summary=article.summary,
        content=article.content,
        trek_id=article.trek_id,
        source_url=article.source_url,
        created_at=article.created_at,
        updated_at=article.updated_at,
    )
