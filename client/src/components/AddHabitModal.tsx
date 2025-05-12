import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertHabitSchema } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = insertHabitSchema.extend({
  description: z.string().optional(),
  reminder: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (habit: FormValues) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({
  open,
  onOpenChange,
  onAddHabit,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "daily",
      reminder: "08:00",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("SUBMIT DETECTED: Form submitted with data:", data);
    console.log("FORM STATE:", form.formState);
    
    try {
      console.log("About to call onAddHabit");
      
      // We'll let the useHabits hook add the userId from the authenticated user
      onAddHabit(data);
      
      console.log("After calling onAddHabit");
      form.reset();
      onOpenChange(false);
      
      // Try direct API call if the regular approach isn't working
      const directApiCall = async () => {
        try {
          console.log("Making direct API call to create habit");
          const response = await fetch('/api/habits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: data.name,
              description: data.description || "",
              frequency: data.frequency,
              reminder: data.reminder
            })
          });
          
          if (!response.ok) {
            console.error("Direct API call failed:", await response.text());
          } else {
            console.log("Direct API call succeeded:", await response.json());
          }
        } catch (err) {
          console.error("Error in direct API call:", err);
        }
      };
      
      // Try direct API call since the normal approach isn't working
      directApiCall();
    } catch (err) {
      console.error("Error in onSubmit handler:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-md rounded-[12px] p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="flex justify-between items-center mb-5">
                <DialogTitle className="text-xl font-semibold">New Habit</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Habit Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., Morning Exercise"
                            className="rounded-[12px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., 30 minutes every day"
                            className="rounded-[12px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={field.value === "daily" ? "outline" : "ghost"}
                            className={`px-4 py-2 rounded-full text-sm ${
                              field.value === "daily"
                                ? "border-primary text-primary bg-primary/5"
                                : "border border-gray-300 text-muted-foreground"
                            }`}
                            onClick={() => field.onChange("daily")}
                          >
                            Daily
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "weekdays" ? "outline" : "ghost"}
                            className={`px-4 py-2 rounded-full text-sm ${
                              field.value === "weekdays"
                                ? "border-primary text-primary bg-primary/5"
                                : "border border-gray-300 text-muted-foreground"
                            }`}
                            onClick={() => field.onChange("weekdays")}
                          >
                            Weekdays
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "custom" ? "outline" : "ghost"}
                            className={`px-4 py-2 rounded-full text-sm ${
                              field.value === "custom"
                                ? "border-primary text-primary bg-primary/5"
                                : "border border-gray-300 text-muted-foreground"
                            }`}
                            onClick={() => field.onChange("custom")}
                          >
                            Custom
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reminder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminders</FormLabel>
                        <div className="flex items-center">
                          <Input
                            type="time"
                            value={field.value}
                            onChange={field.onChange}
                            className="rounded-[12px] mr-2"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-full w-8 h-8 flex items-center justify-center"
                          >
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-[12px]"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary text-white rounded-[12px]"
                    >
                      Create Habit
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default AddHabitModal;
