# TodoMVC Test Plan

## Overview
This test plan covers comprehensive testing of the TodoMVC application, focusing on the core functionality:
- Creating new todo items
- Editing existing todo items
- Marking todos as complete
- Deleting todo items

**Application URL**: https://todomvc.com/examples/vanillajs/
**Seed Test File**: seed.spec.ts

---

## Test Suite 1: Create Todo

### Test Case 1.1: Create a new todo with valid input
**Purpose**: Verify that a user can create a new todo item by entering text in the input field

**Pre-conditions**:
- Application is loaded
- Todo list is visible
- Input field is empty and focused

**Steps**:
1. Click on the "What needs to be done?" input field
2. Type "Buy groceries"
3. Press Enter key
4. Verify the new todo appears in the list

**Expected Results**:
- Todo item "Buy groceries" appears in the list
- Input field is cleared
- Todo count is incremented
- Todo item is in uncompleted state (not checked)

**Test Data**:
- Todo text: "Buy groceries"

**Selectors**:
- Input field: `.new-todo`
- Todo list: `.todo-list`
- Todo item: `.todo-list li`

---

### Test Case 1.2: Create multiple todos in sequence
**Purpose**: Verify that a user can create multiple todo items one after another

**Pre-conditions**:
- Application is loaded
- Todo list is empty

**Steps**:
1. Create first todo: Type "First task" and press Enter
2. Create second todo: Type "Second task" and press Enter
3. Create third todo: Type "Third task" and press Enter
4. Verify all three todos appear in the list

**Expected Results**:
- All three todos appear in the list in order
- Each todo is in uncompleted state
- Todo count shows 3

**Test Data**:
- Todo 1: "First task"
- Todo 2: "Second task"
- Todo 3: "Third task"

---

### Test Case 1.3: Cannot create todo with empty input
**Purpose**: Verify that the application prevents creating empty todo items

**Pre-conditions**:
- Application is loaded

**Steps**:
1. Click on the input field
2. Press Enter without typing any text
3. Verify no todo is created

**Expected Results**:
- No todo item is added to the list
- Input field remains empty
- No error message is displayed (graceful handling)

---

### Test Case 1.4: Create todo with special characters and long text
**Purpose**: Verify that todos with special characters and long text can be created

**Pre-conditions**:
- Application is loaded

**Steps**:
1. Type "Buy milk & eggs @ the store - don't forget! [URGENT]" in input field
2. Press Enter
3. Verify the todo is created with all characters intact

**Expected Results**:
- Todo displays full text with all special characters: & @ - [ ]
- Long text wraps properly in the list
- Todo is in uncompleted state

**Test Data**:
- Todo text: "Buy milk & eggs @ the store - don't forget! [URGENT]"

---

### Test Case 1.5: Create todo using button click instead of Enter key
**Purpose**: Verify that clicking the add button also creates a todo (if applicable)

**Pre-conditions**:
- Application is loaded
- Input field is visible

**Steps**:
1. Type "New todo" in the input field
2. Click the add/submit button (if available)
3. Verify the todo is created

**Expected Results**:
- Todo is created
- Input field is cleared
- New todo appears in the list

**Note**: Skip this test if the application doesn't have an explicit add button

---

## Test Suite 2: Edit Todo

### Test Case 2.1: Edit an existing todo by double-clicking
**Purpose**: Verify that a user can edit a todo item by double-clicking and updating the text

**Pre-conditions**:
- Application is loaded
- At least one todo exists: "Buy milk"

**Steps**:
1. Double-click on the todo item "Buy milk"
2. Verify the todo enters edit mode (shows input field)
3. Clear the current text
4. Type "Buy almond milk"
5. Press Enter to save

**Expected Results**:
- Todo enters edit mode with text field
- Todo text updates to "Buy almond milk"
- Todo exits edit mode
- Todo list displays the updated text

**Test Data**:
- Original text: "Buy milk"
- Updated text: "Buy almond milk"

**Selectors**:
- Todo item: `.todo-list li`
- Edit input: `.todo-list li input.edit`

---

### Test Case 2.2: Edit a todo and cancel the changes
**Purpose**: Verify that a user can cancel editing without saving changes

**Pre-conditions**:
- Application is loaded
- Todo exists: "Buy bread"

**Steps**:
1. Double-click on the todo item "Buy bread"
2. Modify the text to "Buy wheat bread"
3. Press Escape key to cancel
4. Verify the original text is restored

**Expected Results**:
- Edit mode is exited
- Todo text remains "Buy bread" (not updated)
- No changes are saved

**Test Data**:
- Original text: "Buy bread"
- Attempted edit: "Buy wheat bread"

---

### Test Case 2.3: Edit a todo with special characters and long text
**Purpose**: Verify that special characters and long text work when editing

**Pre-conditions**:
- Application is loaded
- Todo exists: "Task #1"

**Steps**:
1. Double-click the todo to edit
2. Change text to "Task #1 - Complete by 5pm & send to boss [HIGH PRIORITY]"
3. Press Enter to save

**Expected Results**:
- All special characters are preserved
- Long text displays correctly
- Edit is saved successfully

**Test Data**:
- Updated text: "Task #1 - Complete by 5pm & send to boss [HIGH PRIORITY]"

---

### Test Case 2.4: Edit a todo and attempt to save with empty input
**Purpose**: Verify the application's behavior when trying to save an empty todo during edit

**Pre-conditions**:
- Application is loaded
- Todo exists: "Buy coffee"

**Steps**:
1. Double-click the todo to edit
2. Delete all text in the input
3. Press Enter

**Expected Results**:
- Todo is deleted (if app deletes empty todos), OR
- Edit is cancelled and original text is preserved (if app prevents empty todos)

**Expected Behavior**: Application should handle gracefully (typically delete empty todos)

---

### Test Case 2.5: Edit multiple todos in sequence
**Purpose**: Verify that editing multiple todos works correctly

**Pre-conditions**:
- Application is loaded
- Multiple todos exist: "Task A", "Task B", "Task C"

**Steps**:
1. Double-click "Task A" and change to "Task A - Updated"
2. Press Enter
3. Double-click "Task B" and change to "Task B - Updated"
4. Press Enter
5. Double-click "Task C" and change to "Task C - Updated"
6. Press Enter

**Expected Results**:
- All three todos are successfully updated
- Each edit is saved independently
- No edits interfere with each other

---

## Test Suite 3: Complete Todo

### Test Case 3.1: Mark a todo as complete using checkbox
**Purpose**: Verify that clicking a checkbox marks a todo as complete

**Pre-conditions**:
- Application is loaded
- Todo exists: "Buy milk" (uncompleted)

**Steps**:
1. Click the checkbox next to "Buy milk"
2. Verify the todo is marked as complete

**Expected Results**:
- Todo checkbox is checked
- Todo text appears with strikethrough
- Todo is visually distinguished (e.g., grayed out)
- Todo counter is updated (if applicable)

**Selectors**:
- Checkbox: `.todo-list li input[type="checkbox"]`

---

### Test Case 3.2: Unmark a completed todo
**Purpose**: Verify that unchecking a checkbox marks a todo as incomplete

**Pre-conditions**:
- Application is loaded
- Todo exists and is marked complete: "Buy milk" ✓

**Steps**:
1. Click the checkbox of the completed todo
2. Verify the todo is marked as incomplete

**Expected Results**:
- Todo checkbox is unchecked
- Strikethrough is removed
- Todo text appears normal
- Todo counter is updated

---

### Test Case 3.3: Mark multiple todos as complete
**Purpose**: Verify that multiple todos can be marked as complete

**Pre-conditions**:
- Application is loaded
- Todos exist: "Task 1", "Task 2", "Task 3" (all uncompleted)

**Steps**:
1. Check the checkbox for "Task 1"
2. Check the checkbox for "Task 2"
3. Check the checkbox for "Task 3"
4. Verify all three are marked as complete

**Expected Results**:
- All three todos show as completed with strikethrough
- Todo counter shows correct count
- Each can be independently unchecked

---

### Test Case 3.4: Mark all todos as complete using 'Mark all' feature
**Purpose**: Verify that the "Mark all" button completes all todos at once

**Pre-conditions**:
- Application is loaded
- Multiple todos exist in uncompleted state

**Steps**:
1. Click the "Mark all" checkbox (if available)
2. Verify all todos are marked as complete

**Expected Results**:
- All todos are checked
- All todos show with strikethrough
- "Mark all" checkbox appears checked

**Note**: Skip if the application doesn't have a "Mark all" feature

**Selectors**:
- Mark all checkbox: `.toggle-all`

---

### Test Case 3.5: Unmark all todos using 'Mark all' feature
**Purpose**: Verify that clicking "Mark all" again unchecks all todos

**Pre-conditions**:
- Application is loaded
- All todos are marked as complete

**Steps**:
1. Click the "Mark all" checkbox again
2. Verify all todos are marked as incomplete

**Expected Results**:
- All checkboxes are unchecked
- No strikethrough on any todo
- "Mark all" checkbox appears unchecked

---

### Test Case 3.6: Toggle between complete and incomplete states
**Purpose**: Verify rapid toggling between states works correctly

**Pre-conditions**:
- Application is loaded
- Todo exists

**Steps**:
1. Check the checkbox
2. Immediately uncheck it
3. Check it again
4. Uncheck it again

**Expected Results**:
- All state changes are applied correctly
- No visual glitches or errors
- UI remains responsive

---

## Test Suite 4: Delete Todo

### Test Case 4.1: Delete a todo using delete button
**Purpose**: Verify that a user can delete a todo by clicking the delete button

**Pre-conditions**:
- Application is loaded
- Todo exists: "Buy milk"

**Steps**:
1. Hover over the todo item "Buy milk"
2. Click the delete button (X icon or trash icon)
3. Verify the todo is removed from the list

**Expected Results**:
- Todo is immediately removed from the list
- Todo counter is decremented
- List updates without page refresh

**Selectors**:
- Delete button: `.todo-list li button.destroy`

---

### Test Case 4.2: Delete a completed todo
**Purpose**: Verify that a completed todo can be deleted

**Pre-conditions**:
- Application is loaded
- Todo exists and is marked complete: "Completed task" ✓

**Steps**:
1. Hover over the completed todo
2. Click the delete button
3. Verify the completed todo is removed

**Expected Results**:
- Completed todo is deleted
- Todo counter is updated correctly
- Completed todos count is decremented (if separate counter)

---

### Test Case 4.3: Delete multiple todos
**Purpose**: Verify that multiple todos can be deleted individually

**Pre-conditions**:
- Application is loaded
- Todos exist: "Task 1", "Task 2", "Task 3"

**Steps**:
1. Delete "Task 1" by clicking its delete button
2. Delete "Task 2" by clicking its delete button
3. Delete "Task 3" by clicking its delete button

**Expected Results**:
- All three todos are deleted in sequence
- Todo counter reaches 0
- List is empty

---

### Test Case 4.4: Delete all completed todos using 'Clear completed' feature
**Purpose**: Verify that the "Clear completed" button removes all completed todos

**Pre-conditions**:
- Application is loaded
- Multiple todos exist with some marked as complete
- Example: "Active 1" (uncompleted), "Done 1" (completed), "Done 2" (completed)

**Steps**:
1. Click the "Clear completed" button
2. Verify all completed todos are removed
3. Verify uncompleted todos remain

**Expected Results**:
- Only completed todos are deleted: "Done 1", "Done 2"
- Uncompleted todo remains: "Active 1"
- Todo counter shows only active todos

**Note**: Skip if application doesn't have "Clear completed" feature

**Selectors**:
- Clear completed button: `.clear-completed`

---

### Test Case 4.5: Delete todo from empty list shows no errors
**Purpose**: Verify graceful handling when attempting to delete from an empty list

**Pre-conditions**:
- Application is loaded
- Todo list is empty

**Steps**:
1. Verify no delete buttons are available
2. Verify no error messages appear

**Expected Results**:
- No delete buttons are visible
- No console errors
- UI remains clean and responsive

---

### Test Case 4.6: Delete all todos one by one until list is empty
**Purpose**: Verify that deleting all todos one at a time results in a clean empty state

**Pre-conditions**:
- Application is loaded
- Todos exist: "Task 1", "Task 2", "Task 3"

**Steps**:
1. Delete "Task 1"
2. Delete "Task 2"
3. Delete "Task 3"
4. Verify list is empty

**Expected Results**:
- All todos are deleted successfully
- List appears empty with appropriate empty state message (if any)
- Todo counter shows 0
- No error messages

---

## Test Suite 5: Integration Tests - Combined Operations

### Test Case 5.1: Full workflow - Create, edit, complete, and delete
**Purpose**: Verify a complete user workflow of todo management

**Pre-conditions**:
- Application is loaded
- Todo list is empty

**Steps**:
1. Create todo: "Buy milk"
2. Edit it to: "Buy organic milk"
3. Create another todo: "Walk the dog"
4. Mark "Buy organic milk" as complete
5. Delete "Buy organic milk"
6. Verify only "Walk the dog" remains

**Expected Results**:
- All operations succeed in sequence
- Final state shows only "Walk the dog" (uncompleted)
- No errors occur during workflow

---

### Test Case 5.2: Create todos with duplicate text
**Purpose**: Verify that the application allows duplicate todo text

**Pre-conditions**:
- Application is loaded

**Steps**:
1. Create first todo: "Call John"
2. Create second todo: "Call John"
3. Verify both todos appear in the list

**Expected Results**:
- Both todos are created and displayed
- Each is a separate list item
- Both can be independently completed or deleted

---

### Test Case 5.3: Rapid creation and deletion of todos
**Purpose**: Verify stability under rapid todo creation and deletion

**Pre-conditions**:
- Application is loaded

**Steps**:
1. Rapidly create 5 todos without delay
2. Immediately delete 3 of them
3. Create 2 more todos
4. Verify final list state is correct

**Expected Results**:
- All operations complete successfully
- No crashes or UI glitches
- Final list shows correct todos (2 from creation, 2 from additions)
- No data loss or corruption

---

### Test Case 5.4: Edit and delete operations maintain list integrity
**Purpose**: Verify that editing and deleting don't corrupt the list

**Pre-conditions**:
- Application is loaded
- Todos exist: "Task 1", "Task 2", "Task 3"

**Steps**:
1. Edit "Task 1" to "Task 1 - Updated"
2. Delete "Task 2"
3. Edit "Task 3" to "Task 3 - Updated"
4. Verify final list shows: "Task 1 - Updated", "Task 3 - Updated"

**Expected Results**:
- List contains only the expected todos
- Edits are preserved
- Deletion removes only the intended todo
- No orphaned or missing items

---

## Filters and Views (if applicable)

### Test Case 6.1: Show all todos
**Purpose**: Verify the "All" filter shows all todos

**Pre-conditions**:
- Application is loaded
- Mix of completed and uncompleted todos exist

**Steps**:
1. Click "All" filter
2. Verify all todos are visible

**Expected Results**:
- All todos (completed and uncompleted) are displayed

---

### Test Case 6.2: Show only active todos
**Purpose**: Verify the "Active" filter shows only uncompleted todos

**Pre-conditions**:
- Application is loaded
- Mix of completed and uncompleted todos exist

**Steps**:
1. Click "Active" filter
2. Verify only uncompleted todos are visible

**Expected Results**:
- Only uncompleted todos are displayed
- Completed todos are hidden from view

---

### Test Case 6.3: Show only completed todos
**Purpose**: Verify the "Completed" filter shows only completed todos

**Pre-conditions**:
- Application is loaded
- Mix of completed and uncompleted todos exist

**Steps**:
1. Click "Completed" filter
2. Verify only completed todos are visible

**Expected Results**:
- Only completed todos are displayed
- Uncompleted todos are hidden from view

---

## Test Execution Notes

- All tests should be run in the order: Create → Edit → Complete → Delete → Integration → Filters
- Each test should start with a clean state (empty todo list)
- Tests should be independent and not rely on order
- Browser refresh should return to the same state (if persistence is implemented)
- Tests should validate both UI changes and data integrity
