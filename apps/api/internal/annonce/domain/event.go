package domain

import (
	"time"

	"github.com/google/uuid"
)

// AnnonceDeposeeEvent is emitted once a new annonce has been deposited and
// persisted. Moderation will subscribe to it.
type AnnonceDeposeeEvent struct {
	id         string
	occurredAt time.Time
	Annonce    *Annonce
}

const AnnonceDeposeeEventType = "AnnonceDeposee"

func NewAnnonceDeposeeEvent(occurredAt time.Time, annonce *Annonce) *AnnonceDeposeeEvent {
	return &AnnonceDeposeeEvent{id: uuid.NewString(), occurredAt: occurredAt, Annonce: annonce}
}

// EventType implements eventbus.DomainEvent.
func (e *AnnonceDeposeeEvent) EventType() string { return AnnonceDeposeeEventType }
func (e *AnnonceDeposeeEvent) ID() string        { return e.id }
func (e *AnnonceDeposeeEvent) OccurredAt() time.Time {
	return e.occurredAt
}
