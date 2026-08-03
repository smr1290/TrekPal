from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db import get_db
from schemas import KnowledgeArticleDetail, KnowledgeArticleListItem
from services.knowledge_trust import disclaimer_for_category, has_external_source
import models

router = APIRouter()


def _list_item(article: models.KnowledgeArticle) -> KnowledgeArticleListItem:
    return KnowledgeArticleListItem(
        id=article.id,
        title=article.title,
        slug=article.slug,
        category=article.category,
        summary=article.summary,
        trek_id=article.trek_id,
        has_source=has_external_source(article.source_url),
        source_label=getattr(article, "source_label", None),
    )


@router.get("/", response_model=list[KnowledgeArticleListItem])
def list_articles(
    category: str | None = Query(default=None, description="Filter by category slug"),
    db: Session = Depends(get_db),
):
    query = db.query(models.KnowledgeArticle).filter(models.KnowledgeArticle.is_published.is_(True))

    if category:
        query = query.filter(models.KnowledgeArticle.category == category)

    articles = query.order_by(models.KnowledgeArticle.title).all()
    return [_list_item(a) for a in articles]


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

    related_rows = (
        db.query(models.KnowledgeArticle)
        .filter(
            models.KnowledgeArticle.is_published.is_(True),
            models.KnowledgeArticle.category == article.category,
            models.KnowledgeArticle.id != article.id,
        )
        .order_by(models.KnowledgeArticle.title)
        .limit(3)
        .all()
    )

    return KnowledgeArticleDetail(
        id=article.id,
        title=article.title,
        slug=article.slug,
        category=article.category,
        summary=article.summary,
        content=article.content,
        trek_id=article.trek_id,
        source_url=article.source_url,
        source_label=getattr(article, "source_label", None),
        has_source=has_external_source(article.source_url),
        disclaimer=disclaimer_for_category(article.category),
        created_at=article.created_at,
        updated_at=article.updated_at,
        related=[_list_item(r) for r in related_rows],
    )
